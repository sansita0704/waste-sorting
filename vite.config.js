import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api/* is proxied to your backend so you don't need CORS while building.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": { target: env.VITE_API_PROXY ?? "http://localhost:8000", changeOrigin: true },
      },
    },
  };
});
