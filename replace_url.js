const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.json') || fullPath.endsWith('.html') || fullPath.endsWith('.txt')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:3000/api')) {
        content = content.split('http://localhost:3000/api').join('/api');
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'frontend', '.next'));
