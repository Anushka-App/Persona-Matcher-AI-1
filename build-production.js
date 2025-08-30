import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting production build with correct environment...');

try {
    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // 2. Build the React app with production environment
    console.log('🔨 Building React app for production...');
    
    // Set production environment variables
    const env = {
        ...process.env,
        NODE_ENV: 'production',
        VITE_API_BASE_URL: '', // Use empty string for production (endpoints already have /api)
        VITE_PROD: 'true'
    };
    
    execSync('npm run build', { 
        stdio: 'inherit',
        env: env
    });

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

    // 6. Create a production environment file for the server
    console.log('📝 Creating production environment configuration...');
    const envContent = `# Production Environment Configuration
NODE_ENV=production
PORT=8000
GEMINI_API_KEY=${process.env.GEMINI_API_KEY || 'your_gemini_api_key_here'}
DATABASE_URL=${process.env.DATABASE_URL || 'your_database_url_here'}

`;

    fs.writeFileSync(path.join(process.cwd(), '.env.production'), envContent);

    console.log('✅ Production build completed successfully!');
    console.log('📁 Built files are in the /dist folder');
    console.log('🚀 Ready for deployment on Render');
    console.log('🔧 Environment variables set for production');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
