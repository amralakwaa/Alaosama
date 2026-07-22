process.env.JWT_SECRET = 'super_secret_orion_jwt_key_2026_hostinger';
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const FRONTEND_PORT = 3002;
const BACKEND_PORT = 3001;

// Setup logging so we can see what goes wrong on the server
const outLog = fs.openSync(path.join(__dirname, 'gateway_out.log'), 'a');
const errLog = fs.openSync(path.join(__dirname, 'gateway_err.log'), 'a');

console.log(`Starting Unified Server Gateway on PORT ${PORT}...`);

// 1. Start Backend on Internal Port 3001 using exact Node path
const backendProcess = spawn(process.execPath, ['dist/main.js'], {
  cwd: path.join(__dirname, 'backend'),
  env: { ...process.env, PORT: BACKEND_PORT },
  stdio: ['ignore', outLog, errLog]
});

// 2. Start Frontend on Internal Port 3002 using exact Node path
const frontendProcess = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start'], {
  cwd: path.join(__dirname, 'frontend'),
  env: { ...process.env, PORT: FRONTEND_PORT, NEXT_PUBLIC_API_URL: `http://127.0.0.1:${BACKEND_PORT}/api` },
  stdio: ['ignore', outLog, errLog]
});

// 3. Create Gateway Server to satisfy Hostinger's port binding requirement
const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: FRONTEND_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    if (res.headersSent) return;
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (e) => {
    if (res.headersSent) return;
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('التطبيق قيد التشغيل الآن، يرجى تحديث الصفحة بعد ثوانٍ قليلة... (App is booting up)\\nError Details: ' + e.message);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log(`Gateway successfully bound to port ${PORT}`);
});

// Handle shutdown gracefully
const shutdown = () => {
  console.log('Shutting down servers...');
  backendProcess.kill('SIGTERM');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
