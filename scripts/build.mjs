
import { build } from 'esbuild';
import stylePlugin from 'esbuild-style-plugin';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const isDev = !process.argv.includes('--production');

// Clean the dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Copy public files
if (fs.existsSync('public')) {
  fs.cpSync('public', 'dist', { recursive: true });
}

// Build with esbuild
build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: !isDev,
  sourcemap: isDev,
  plugins: [stylePlugin()],
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
  },
}).catch(() => process.exit(1));

// Generate index.html
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CryptoSniper Pro</title>
    <link rel="stylesheet" href="bundle.css">
</head>
<body>
    <div id="root"></div>
    <script src="bundle.js"></script>
</body>
</html>`;

fs.writeFileSync('dist/index.html', htmlContent);

console.log('Build complete!');

