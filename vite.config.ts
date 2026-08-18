import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  // Keep local password-reset links on the frontend development origin.
  server: {
    port: 5173,
    strictPort: true,
  },

  preview: {
    port: 5173,
    strictPort: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // Boosted (our Bootstrap fork) still uses the legacy Sass @import
        // API internally, and our own partials mirror that today. These
        // are deprecation *warnings* only — silenced here rather than
        // fixed, since migrating to @use/@forward is a real refactor of
        // every partial and Boosted's own source isn't ours to change.
        silenceDeprecations: ["import", "global-builtin", "color-functions", "if-function"],
        quietDeps: true,
      },
    },
  },
});
