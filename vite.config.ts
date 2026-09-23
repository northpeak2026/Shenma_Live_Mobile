import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Pages serves this project below its repository name; local Vite keeps root paths.
  base: process.env.GITHUB_ACTIONS ? "/Shenma_Live_Mobile/" : "/",
  build: {
    outDir: "dist/client",
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  plugins: [react()],
});
