// vite.config.ts
import { defineConfig } from "file:///D:/Persona-Matcher-AI-1/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Persona-Matcher-AI-1/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///D:/Persona-Matcher-AI-1/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\Persona-Matcher-AI-1";
var vite_config_default = defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  return {
    server: {
      host: "::",
      port: 3001,
      proxy: {
        "/recommendations": {
          target: isProduction ? "/api" : "http://localhost:8000",
          changeOrigin: true,
          rewrite: isProduction ? (path2) => path2.replace(/^\/recommendations/, "/api/index") : void 0
        },
        "/loading-images": {
          target: isProduction ? "/api" : "http://localhost:8000",
          changeOrigin: true,
          rewrite: isProduction ? (path2) => path2.replace(/^\/loading-images/, "/api/index") : void 0
        },
        "/api": {
          target: isProduction ? "/api" : "http://localhost:8000",
          changeOrigin: true
        }
      }
    },
    plugins: [
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      rollupOptions: {
        external: ["/adaptive-quiz-engine.js"]
      }
    },
    define: {
      // Define environment variables for the client
      __DEV__: !isProduction,
      __PROD__: isProduction,
      // For production, these will be replaced with actual values
      __BACKEND_URL__: isProduction ? JSON.stringify("/api") : JSON.stringify("http://localhost:8000")
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQZXJzb25hLU1hdGNoZXItQUktMVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUGVyc29uYS1NYXRjaGVyLUFJLTFcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BlcnNvbmEtTWF0Y2hlci1BSS0xL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgaXNQcm9kdWN0aW9uID0gbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgaG9zdDogXCI6OlwiLFxyXG4gICAgICBwb3J0OiAzMDAxLFxyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgICcvcmVjb21tZW5kYXRpb25zJzoge1xyXG4gICAgICAgICAgdGFyZ2V0OiBpc1Byb2R1Y3Rpb24gPyAnL2FwaScgOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHJld3JpdGU6IGlzUHJvZHVjdGlvbiA/IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9yZWNvbW1lbmRhdGlvbnMvLCAnL2FwaS9pbmRleCcpIDogdW5kZWZpbmVkLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJy9sb2FkaW5nLWltYWdlcyc6IHtcclxuICAgICAgICAgIHRhcmdldDogaXNQcm9kdWN0aW9uID8gJy9hcGknIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICByZXdyaXRlOiBpc1Byb2R1Y3Rpb24gPyAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvbG9hZGluZy1pbWFnZXMvLCAnL2FwaS9pbmRleCcpIDogdW5kZWZpbmVkLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IGlzUHJvZHVjdGlvbiA/ICcvYXBpJyA6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICByZWFjdCgpLFxyXG4gICAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIGV4dGVybmFsOiBbJy9hZGFwdGl2ZS1xdWl6LWVuZ2luZS5qcyddLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICAvLyBEZWZpbmUgZW52aXJvbm1lbnQgdmFyaWFibGVzIGZvciB0aGUgY2xpZW50XHJcbiAgICAgIF9fREVWX186ICFpc1Byb2R1Y3Rpb24sXHJcbiAgICAgIF9fUFJPRF9fOiBpc1Byb2R1Y3Rpb24sXHJcbiAgICAgIC8vIEZvciBwcm9kdWN0aW9uLCB0aGVzZSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggYWN0dWFsIHZhbHVlc1xyXG4gICAgICBfX0JBQ0tFTkRfVVJMX186IGlzUHJvZHVjdGlvbiA/IEpTT04uc3RyaW5naWZ5KCcvYXBpJykgOiBKU09OLnN0cmluZ2lmeSgnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyksXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJQLFNBQVMsb0JBQW9CO0FBQ3hSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxlQUFlLFNBQVM7QUFFOUIsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsb0JBQW9CO0FBQUEsVUFDbEIsUUFBUSxlQUFlLFNBQVM7QUFBQSxVQUNoQyxjQUFjO0FBQUEsVUFDZCxTQUFTLGVBQWUsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLHNCQUFzQixZQUFZLElBQUk7QUFBQSxRQUN2RjtBQUFBLFFBQ0EsbUJBQW1CO0FBQUEsVUFDakIsUUFBUSxlQUFlLFNBQVM7QUFBQSxVQUNoQyxjQUFjO0FBQUEsVUFDZCxTQUFTLGVBQWUsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLHFCQUFxQixZQUFZLElBQUk7QUFBQSxRQUN0RjtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sUUFBUSxlQUFlLFNBQVM7QUFBQSxVQUNoQyxjQUFjO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxJQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLElBQ2hCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLFVBQVUsQ0FBQywwQkFBMEI7QUFBQSxNQUN2QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLE1BRU4sU0FBUyxDQUFDO0FBQUEsTUFDVixVQUFVO0FBQUE7QUFBQSxNQUVWLGlCQUFpQixlQUFlLEtBQUssVUFBVSxNQUFNLElBQUksS0FBSyxVQUFVLHVCQUF1QjtBQUFBLElBQ2pHO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
