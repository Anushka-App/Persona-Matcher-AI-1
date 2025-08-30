import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: "::",
      port: 3000,
      proxy: {
        '/recommendations': {
          target: isProduction ? '/api' : 'http://localhost:8000',
          changeOrigin: true,
          rewrite: isProduction ? (path) => path.replace(/^\/recommendations/, '/api/index') : undefined,
        },
        '/loading-images': {
          target: isProduction ? '/api' : 'http://localhost:8000',
          changeOrigin: true,
          rewrite: isProduction ? (path) => path.replace(/^\/loading-images/, '/api/index') : undefined,
        },
        '/api': {
          target: isProduction ? '/api' : 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        external: ['/adaptive-quiz-engine.js'],
      },
    },
    define: {
      // Define environment variables for the client
      __DEV__: !isProduction,
      __PROD__: isProduction,
      // For production, these will be replaced with actual values
      __BACKEND_URL__: isProduction ? JSON.stringify('/api') : JSON.stringify('http://localhost:8000'),
      // Ensure VITE_API_BASE_URL is properly set for production
      'import.meta.env.VITE_API_BASE_URL': isProduction ? JSON.stringify('') : JSON.stringify('http://localhost:8000'),
      'import.meta.env.PROD': JSON.stringify(isProduction),
    },
  };
});
