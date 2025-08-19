/**
 * Build script for CryptoSniper Pro
 * Simplified version without external plugins
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';

const isDev = !process.argv.includes('--production');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy public files if they exist
if (fs.existsSync('public')) {
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };
  
  try {
    copyDir('public', 'dist');
  } catch (error) {
    console.log('No public directory found, continuing...');
  }
}

// Generate index.html
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CryptoSniper Pro - Advanced Ethereum Sniping Bot</title>
    <meta name="description" content="Advanced crypto sniping bot for Ethereum with MEV protection and real-time analytics">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        #root { min-height: 100vh; }
        .loading { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <div>Loading CryptoSniper Pro...</div>
        </div>
    </div>
    <script src="/bundle.js"></script>
</body>
</html>`;

fs.writeFileSync('dist/index.html', htmlContent);

if (isDev) {
  console.log('🚀 Starting CryptoSniper Pro development server...');
  
 // Use React's built-in development server
 // const reactProcess = spawn('npx', ['react-scripts', 'start'], {
 //   stdio: 'inherit',
 //   shell: true,
 //   env: {
 //     ...process.env,
 //     PORT: '3000',
 //     BROWSER: 'none'
 //   }
 // });

  reactProcess.on('close', (code) => {
    console.log(`React development server exited with code ${code}`);
  });

  reactProcess.on('error', (error) => {
    console.error('Failed to start React development server:', error);
    console.log('Falling back to simple file server...');
    
    // Fallback to simple file server
    const server = http.createServer((req, res) => {
      const url = req.url === '/' ? '/index.html' : req.url;
      const filePath = path.join('dist', url);
      
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
        }[ext] || 'text/plain';
        
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('dist/index.html').pipe(res);
      }
    });

    const port = 3000;
    server.listen(port, () => {
      console.log(`🚀 CryptoSniper Pro dev server running at http://localhost:${port}`);
    });
  });
  
} else {
  console.log('🏗️ Building for production...');
  
  const buildProcess = spawn('npx', ['react-scripts', 'build'], {
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Production build complete!');
    } else {
      console.error(`❌ Build failed with code ${code}`);
    }
  });
}
