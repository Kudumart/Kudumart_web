import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  server: {
    // Enable history API fallback for SPA
    historyApiFallback: true,
  },
  // build: {
  //   // Optional: Ensure proper handling in production builds
  //   rollupOptions: {
  //     output: {
  //       manualChunks: undefined, // Keeps chunks together for better routing
  //     },
  //   },
  // },
  resolve: {
    alias: {
      "@": "/src",
      // Route all react-toastify imports → our Sonner shim
      // This means every existing `import { toast } from 'react-toastify'`
      // now uses Sonner under the hood — no source files need to change.
      "react-toastify": "/src/lib/toast-shim.js",
    },
  },
});
