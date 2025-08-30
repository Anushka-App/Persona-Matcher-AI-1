/**
 * Startup script to run both frontend and backend
 */
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting Persona Matcher application...');

// Start Vite frontend
const frontendProcess = spawn('npm', ['run', 'start'], {
  stdio: 'inherit',
  shell: true
});

console.log('✅ Started frontend development server');

// Start Express backend
const backendProcess = spawn('npm', ['run', 'server:new'], {
  stdio: 'inherit',
  shell: true
});

console.log('✅ Started backend API server');

// Handle process exit
process.on('SIGINT', () => {
  console.log('⚠️ Shutting down all processes...');
  frontendProcess.kill('SIGINT');
  backendProcess.kill('SIGINT');
  process.exit(0);
});

// Handle process errors
frontendProcess.on('error', (error) => {
  console.error('❌ Frontend process error:', error);
});

backendProcess.on('error', (error) => {
  console.error('❌ Backend process error:', error);
});

console.log('✨ Development environment ready!');
console.log('📝 Access the frontend at: http://localhost:3001');
console.log('🔌 Access the API at: http://localhost:8000');
