#!/usr/bin/env node

// Set the port environment variable and start the server
process.env.PORT = '8080';

console.log('🚀 Starting server on port 8080...');
console.log('📱 Frontend will be available at: http://localhost:8080');
console.log('🔧 Backend API will be available at: http://localhost:8080/api');

// Import and start the server
const { spawn } = require('child_process');

// Start the TypeScript server
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '8080' }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
});
