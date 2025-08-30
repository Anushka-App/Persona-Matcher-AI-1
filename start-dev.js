#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Persona Matcher AI Development Environment...\n');

// First, build the React app
console.log('🔨 Building React app...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ React app built successfully');
    
    // Start backend server on port 8000
    console.log('📡 Starting Backend Server on port 8000...');
    const server = spawn('npx', ['tsx', 'server/index.ts'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env, PORT: '8000' },
      shell: true
    });

    // Wait a bit for server to start
    setTimeout(() => {
      console.log('🌐 Starting Frontend on port 3001...');
      
      // Start frontend on port 3001
      const frontend = spawn('npx', ['vite', '--port', '3001'], {
        stdio: 'inherit',
        cwd: __dirname,
        shell: true
      });

      // Handle frontend process
      frontend.on('error', (error) => {
        console.error('❌ Frontend error:', error);
      });

      frontend.on('close', (code) => {
        console.log(`🌐 Frontend process exited with code ${code}`);
      });

    }, 3000);

    // Handle server process
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

    server.on('close', (code) => {
      console.log(`📡 Server process exited with code ${code}`);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      server.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development environment...');
      server.kill('SIGTERM');
      process.exit(0);
    });

    console.log('✅ Development environment starting...');
    console.log('📡 Backend: http://localhost:8000');
    console.log('🌐 Frontend: http://localhost:3001');
    console.log('\n💡 Press Ctrl+C to stop both services\n');
    
  } else {
    console.error('❌ Failed to build React app');
    process.exit(1);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build error:', error);
  process.exit(1);
});
