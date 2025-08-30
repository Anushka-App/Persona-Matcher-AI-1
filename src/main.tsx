import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { setupGlobalErrorHandler } from './lib/errorHandler';

// Setup global error handler for third-party embed errors
setupGlobalErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);