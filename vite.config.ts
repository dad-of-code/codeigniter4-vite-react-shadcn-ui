import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import codeigniter from "./codeigniter.vite"
import { dev, build as buildConfig } from "./codeigniter.config"

// https://vite.dev/config/
const devMode = process.env.NODE_ENV !== "production"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    codeigniter({
      // ---------------------------------------------------------------
      //  Define your React entry points and their access rules here.
      //  The CI4 AssetController enforces these at the chunk level.
      // ---------------------------------------------------------------
      entries: {
        index: {
          input: "src/index.tsx",       // Public / login / landing
          access: "public",
        },
        protected: {
          input: "src/protected.tsx",   // Authenticated dashboard
          access: "auth",
          // Optionally restrict to specific Shield groups/permissions:
          // groups: ['user', 'admin', 'superadmin'],
          // permissions: ['admin.access'],
        },
      },
      buildPath: buildConfig.outDir,
    }),
  ],

  // ── Dev server ────────────────────────────────────────────────────
  server: {
    port: dev.vitePort,
    strictPort: true,
    cors: true,
    origin: dev.origin,
    proxy: {
      // Forward /api requests to the CI4 dev server
      [dev.apiPrefix]: {
        target: dev.ciOrigin,
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ── Build ─────────────────────────────────────────────────────────
  build: {
    outDir: buildConfig.outDir,
    assetsDir: buildConfig.assetsDir,
    cssCodeSplit: buildConfig.cssCodeSplit,
    emptyOutDir: buildConfig.emptyOutDir,
    manifest: true,
    chunkSizeWarningLimit: buildConfig.chunkSizeWarningLimit,
    sourcemap: devMode,
    reportCompressedSize: !devMode,
    rollupOptions: {
      output: {
        entryFileNames: buildConfig.fileNames.entry,
        chunkFileNames: buildConfig.fileNames.chunk,
        assetFileNames: buildConfig.fileNames.asset,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
