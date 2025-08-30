import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting production build...');

try {
    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // 2. Build the React app
    console.log('🔨 Building React app...');
    execSync('npm run build', { stdio: 'inherit' });

    // 3. Check if dist folder exists
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
        throw new Error('Build failed: dist folder not found');
    }

    // 4. Build the TypeScript server
    console.log('🔨 Building TypeScript server...');
    execSync('npm run build:server', { stdio: 'inherit' });

    // 5. Check if server/index.cjs exists
    const serverPath = path.join(process.cwd(), 'server', 'index.cjs');
    if (!fs.existsSync(serverPath)) {
        throw new Error('Server build failed: server/index.cjs not found');
    }

    console.log('✅ Production build completed successfully!');
    console.log('📁 Built files are in the /dist folder');
    console.log('🚀 Ready for deployment on Render');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} 