#!/usr/bin/env node
/**
 * Build script for CryptoSniper Pro
 * - Development: retains CRA dev server (npx react-scripts start)
 * - Production: uses esbuild to bundle the app (avoids CRA/webpack/ajv issues on Netlify)
 *
 * Notes:
 * - We keep Tailwind via CDN in the generated HTML (no PostCSS step needed at build time).
 * - CSS imports in TS/TSX are ignored during the esbuild step to simplify the pipeline.
 * - public/ is copied to dist/ first; then index.html is generated (overwriting any public/index.html).
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { build as esbuild } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !process.argv.includes('--production');

/**
 * Recursively copy a directory
 * @param {string} src - source directory
 * @param {string} dest - destination directory
 */
const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

/**
 * HTML template for the app shell
 * - Includes Tailwind CDN (JIT) and a minimal base style
 * - Injects Supabase runtime env (as per your prior public/index.html)
 * - Loads the bundled script at /bundle.js
 */
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, user-scalable=no"
  />
  <title>CryptoSniper Pro - Advanced Ethereum Sniping Bot</title>
  <meta name="theme-color" content="#0b1221" />
  <meta name="description" content="Advanced crypto sniping bot for Ethereum with MEV protection and real-time analytics" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <!-- Tailwind CDN (JIT) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Runtime env injection: Supabase (managed auth) -->
  <script>
    window.__ENV__ = Object.assign({}, window.__ENV__ || {}, {
      REACT_APP_SUPABASE_URL: "https://pritacouhsqmrukolbbo.supabase.co",
      REACT_APP_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaXRhY291aHNxbXJ1a29sYmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDAxMTcsImV4cCI6MjA3MDUxNjExN30.ibkv6KaQkpIwxJojIZTKKdiTllfyaKZ-edOUWLr6Quk"
    });
  </script>

  <style>
    html, body, #root { height: 100%; }
    body { margin: 0; background: #070b14; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; }
    .loading {
      display: flex;
      align-items: center; justify-content: center;
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

/**
 * esbuild plugin to ignore any imported CSS files.
 * We rely on Tailwind CDN and component utility classes instead.
 */
const ignoreCssPlugin = {
  name: 'ignore-css',
  setup(build) {
    build.onResolve({ filter: /\\.css$/ }, (args) => {
      return { path: args.path, namespace: 'ignore-css' };
    });
    build.onLoad({ filter: /.*/, namespace: 'ignore-css' }, () => {
      return { contents: '', loader: 'js' };
    });
  },
};

/**
 * Find the most suitable entry file
 * @returns {string} path to entry file
 */
function resolveEntry() {
  const candidates = ['src/index.tsx', 'src/main.tsx', 'src/index.ts', 'src/main.ts'];
  const found = candidates.find((p) => fs.existsSync(path.join(__dirname, '..', p)) || fs.existsSync(p));
  if (found) return found;
  throw new Error('No entry file found. Expected one of: ' + candidates.join(', '));
}

/**
 * Perform a production build with esbuild
 */
async function buildProd() {
  // Ensure dist exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Copy public files if exist
  if (fs.existsSync('public')) {
    try {
      copyDir('public', 'dist');
    } catch {
      // no-op
    }
  }

  // Write our HTML shell
  fs.writeFileSync('dist/index.html', htmlContent);

  const entry = resolveEntry();

  // Bundle with esbuild
  await esbuild({
    entryPoints: [entry],
    outfile: 'dist/bundle.js',
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: 'browser',
    target: ['es2018', 'chrome80'],
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.REACT_APP_ENVIRONMENT': JSON.stringify(process.env.REACT_APP_ENVIRONMENT || 'production'),
      'process.env.REACT_APP_SITE_URL': JSON.stringify(process.env.REACT_APP_SITE_URL || ''),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || ''),
    },
    plugins: [ignoreCssPlugin],
  });

  console.log('✅ Production bundle created at dist/bundle.js');
}

/**
 * Start development using CRA dev server (unchanged)
 * Falls back to a simple static file server if CRA fails.
 */
function startDev() {
  console.log('🚀 Starting CryptoSniper Pro development server...');
  const reactProcess = spawn('npx', ['react-scripts', 'start'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: '3000',
      BROWSER: 'none',
    },
  });

  reactProcess.on('close', (code) => {
    console.log('React development server exited with code \${code}');
  });

  reactProcess.on('error', (error) => {
    console.error('Failed to start React development server:', error);
    console.log('Falling back to simple file server...');

    // Fallback static server serving dist
    const server = http.createServer((req, res) => {
      const url = req.url === '/' ? '/index.html' : req.url;
      const filePath = path.join('dist', url);

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        const contentType =
          {
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
      console.log(\`🚀 CryptoSniper Pro dev server running at http://localhost:\${port}\`);
    });
  });
}

// Entrypoint
(async () => {
  if (isDev) {
    startDev();
  } else {
    console.log('🏗️ Building for production with esbuild...');
    try {
      await buildProd();
    } catch (err) {
      console.error('❌ Production build failed:', err);
      process.exit(1);
    }
  }
})();
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
  const reactProcess = spawn('npx', ['react-scripts', 'start'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: '3000',
      BROWSER: 'none'
    }
  });

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
