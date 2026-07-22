const fs = require('fs');
const path = require('path');

console.log('--- Starting static files copy for Hostinger ---');

const source = path.join(__dirname, 'frontend', '.next', 'static');
// Assume public_html is a sibling of the current directory (project_orion)
const targetDir = path.join(__dirname, '..', 'public_html');

if (fs.existsSync(targetDir)) {
  const nextTarget = path.join(targetDir, '_next');
  if (!fs.existsSync(nextTarget)) {
    fs.mkdirSync(nextTarget, { recursive: true });
  }
  
  const staticTarget = path.join(nextTarget, 'static');
  
  console.log(`Copying static files from ${source} to ${staticTarget}...`);
  try {
    fs.cpSync(source, staticTarget, { recursive: true });
    console.log('✅ Static files copied successfully to public_html!');
  } catch (error) {
    console.error('❌ Failed to copy static files:', error.message);
  }
} else {
  console.log('⚠️ public_html not found at parent directory. Skipping static copy.');
  console.log('If your public_html is located elsewhere, you may need to copy frontend/.next/static to public_html/_next/static manually.');
}
