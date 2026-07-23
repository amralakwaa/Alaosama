/**
 * fix_source_urls.js
 * Replaces all hardcoded localhost fallback API URLs in source files.
 * Run once from project root: node fix_source_urls.js
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const extensions = ['.tsx', '.ts', '.js', '.jsx'];

// Pattern: const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
// Replace fallback with relative /api
const patterns = [
  {
    // handles both double and single quotes, with or without spaces
    regex: /process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*["']http:\/\/localhost:\d+\/api["']/g,
    replacement: 'process.env.NEXT_PUBLIC_API_URL || "/api"'
  },
  {
    // standalone hardcoded string used as a const
    regex: /const\s+API\s*=\s*["']http:\/\/localhost:\d+\/api["']/g,
    replacement: 'const API = process.env.NEXT_PUBLIC_API_URL || "/api"'
  },
  {
    // let API = "http://..."
    regex: /let\s+API\s*=\s*["']http:\/\/localhost:\d+\/api["']/g,
    replacement: 'let API = process.env.NEXT_PUBLIC_API_URL || "/api"'
  },
  {
    // const l = "http://localhost:3000/api"  (minified pattern inside built layout)
    regex: /let\s+[a-z]\s*=\s*["']http:\/\/localhost:\d+\/api["']/g,
    replacement: (m) => m.replace(/["']http:\/\/localhost:\d+\/api["']/, '"/api"')
  }
];

let totalFixed = 0;

function walkDir(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(entry)) walkDir(full);
    } else if (extensions.includes(path.extname(entry))) {
      let content = fs.readFileSync(full, 'utf8');
      let modified = false;
      for (const p of patterns) {
        const newContent = content.replace(p.regex, typeof p.replacement === 'function' ? p.replacement : p.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('Fixed: ' + full.replace(__dirname, '.'));
        totalFixed++;
      }
    }
  }
}

walkDir(srcDir);
console.log(`\nDone. Fixed ${totalFixed} source files.`);
