import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative assets keep the build portable for GitHub Pages project subpaths.
  base: "./",
  build: {
    outDir: "dist/client",
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  plugins: [react()],
});
