import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/notification": {
        target: "http://34.120.215.23",
        changeOrigin: true,
        secure: false,
        ws: true,
        followRedirects: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (_proxyReq, req) => {
            console.log(`[Proxy] ${req.url} -> ${options.target}`);
          });
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("scheduler")
          ) {
            return "vendor-react";
          }

          if (id.includes("react-router")) {
            return "vendor-router";
          }

          if (id.includes("@tanstack/react-query")) {
            return "vendor-query";
          }

          if (id.includes("styled-components")) {
            return "vendor-style";
          }

          if (id.includes("recharts")) {
            return "vendor-chart";
          }

          if (id.includes("react-datepicker") || id.includes("date-fns")) {
            return "vendor-date";
          }

          return "vendor";
        },
      },
    },
  },
});
