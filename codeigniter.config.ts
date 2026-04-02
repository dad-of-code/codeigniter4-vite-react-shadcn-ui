/**
 * Unified development configuration for CodeIgniter 4 + Vite.
 *
 * This is the single source of truth for ports, hosts, and paths
 * used by vite.config.ts, dev.bat, and php spark vite:dev.
 *
 * Import in vite.config.ts:
 *   import { dev, build } from './ci.config'
 */

// ── Development Server Ports ──────────────────────────────────────
export const dev = {
  /** Port for the CodeIgniter PHP dev server */
  ciPort: 8080,

  /** Port for the Vite dev server */
  vitePort: 5173,

  /** Host the Vite dev server binds to */
  host: 'localhost',

  /** Full origin URL for the Vite dev server (used in CORS / hot file) */
  get origin() {
    return `http://${this.host}:${this.vitePort}`
  },

  /** Full origin URL for the CI4 dev server (proxy target) */
  get ciOrigin() {
    return `http://${this.host}:${this.ciPort}`
  },

  /** API route prefix — all backend API calls go through this path */
  apiPrefix: '/api',
} as const

// ── Build Output ──────────────────────────────────────────────────
export const build = {
  /** Vite output directory (relative to project root) */
  outDir: 'writable/app',

  /** Subdirectory inside outDir for hashed assets */
  assetsDir: 'assets',

  /** Enable CSS code splitting per entry */
  cssCodeSplit: true,

  /** Remove the outDir contents before each build */
  emptyOutDir: true,

  /** Warn when a chunk exceeds this size (KB) */
  chunkSizeWarningLimit: 5000,

  /** File naming patterns */
  fileNames: {
    entry: 'assets/[name]-[hash].js',
    chunk: 'assets/chunks/[name]-[hash].js',
    asset: 'assets/[name]-[hash][extname]',
  },
} as const

export default { dev, build }
