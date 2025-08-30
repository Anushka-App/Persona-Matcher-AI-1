// Debug logger utility for managing console logs
const isDevelopment = process.env.NODE_ENV === 'development';

export const debugLog = {
  // Only log in development
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  // Always log errors
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  // Only log warnings in development
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  // Only log info in development
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

export default debugLog;
