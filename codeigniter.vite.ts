import fs from 'fs'
import path from 'path'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'

export interface EntryAccess {
  access: 'public' | 'auth'
  groups?: string[]
  permissions?: string[]
}

export interface EntryConfig extends EntryAccess {
  input: string
}

export interface CodeIgniterPluginConfig {
  /** Named entries with access control metadata */
  entries: Record<string, EntryConfig>
  /** Output directory relative to project root (default: 'writable/app') */
  buildPath?: string
  /** Hot file path override (default: '<buildPath>/hot') */
  hotFile?: string
}

interface CIManifestEntry {
  input: string
  access: string
  groups: string[]
  permissions: string[]
  files: { js: string[]; css: string[] }
  chunks: string[]
  preloads: string[]
}

interface CIManifest {
  entries: Record<string, CIManifestEntry>
  /** Maps every output file to its effective access rule */
  fileAccess: Record<string, EntryAccess>
}

/**
 * Vite plugin for CodeIgniter 4 integration.
 *
 * - Dev mode: writes a `hot` file so the PHP helper knows the dev-server URL.
 * - Build mode: generates `ci-manifest.json` alongside the standard Vite manifest,
 *   mapping each output file to its access-control rule derived from the entry config.
 */
export default function codeigniter(config: CodeIgniterPluginConfig): Plugin {
  const buildPath = config.buildPath ?? 'writable/app'
  const hotFilePath = config.hotFile ?? path.join(buildPath, 'hot')
  let resolvedConfig: ResolvedConfig

  return {
    name: 'vite-plugin-codeigniter',
    enforce: 'post',

    /* ------------------------------------------------------------------ */
    /*  Merge rollup input from entries                                   */
    /* ------------------------------------------------------------------ */
    config() {
      const input: Record<string, string> = {}
      for (const [name, entry] of Object.entries(config.entries)) {
        input[name] = entry.input
      }

      return {
        build: {
          manifest: true,
          rollupOptions: { input },
        },
      }
    },

    configResolved(resolved) {
      resolvedConfig = resolved
    },

    /* ------------------------------------------------------------------ */
    /*  Dev: write hot file with dev-server URL                           */
    /* ------------------------------------------------------------------ */
    configureServer(server: ViteDevServer) {
      // Write once the http server is actually listening so we get the real port
      server.httpServer?.once('listening', () => {
        const protocol = resolvedConfig.server.https ? 'https' : 'http'
        const host =
          typeof resolvedConfig.server.host === 'string'
            ? resolvedConfig.server.host
            : 'localhost'
        const address = server.httpServer!.address()
        const port =
          address && typeof address === 'object'
            ? address.port
            : (resolvedConfig.server.port ?? 5173)

        fs.mkdirSync(path.dirname(path.resolve(hotFilePath)), {
          recursive: true,
        })
        fs.writeFileSync(
          path.resolve(hotFilePath),
          `${protocol}://${host}:${port}`,
        )
      })

      const cleanup = () => {
        try {
          if (fs.existsSync(path.resolve(hotFilePath))) {
            fs.rmSync(path.resolve(hotFilePath))
          }
        } catch {
          /* ignore */
        }
      }
      process.on('exit', cleanup)
      process.on('SIGINT', () => {
        cleanup()
        process.exit()
      })
      process.on('SIGTERM', () => {
        cleanup()
        process.exit()
      })
    },

    /* ------------------------------------------------------------------ */
    /*  Build: generate ci-manifest.json                                  */
    /* ------------------------------------------------------------------ */
    closeBundle() {
      const manifestPath = path.resolve(buildPath, '.vite', 'manifest.json')
      if (!fs.existsSync(manifestPath)) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const manifest: Record<string, any> = JSON.parse(
        fs.readFileSync(manifestPath, 'utf-8'),
      )

      // Recursively collect every output file reachable from a manifest key
      function collectFiles(
        key: string,
        visited = new Set<string>(),
      ): { js: string[]; css: string[]; assets: string[]; preloads: string[] } {
        if (visited.has(key)) return { js: [], css: [], assets: [], preloads: [] }
        visited.add(key)

        const entry = manifest[key]
        if (!entry) return { js: [], css: [], assets: [], preloads: [] }

        const js: string[] = []
        const css: string[] = entry.css ? [...entry.css] : []
        const assets: string[] = entry.assets ? [...entry.assets] : []
        const preloads: string[] = []

        // Imported chunks
        if (entry.imports) {
          for (const imp of entry.imports) {
            const sub = manifest[imp]
            if (sub) {
              preloads.push(sub.file)
              const nested = collectFiles(imp, visited)
              js.push(...nested.js)
              css.push(...nested.css)
              assets.push(...nested.assets)
              preloads.push(...nested.preloads)
            }
          }
        }

        // Dynamic imports are NOT preloaded but still tracked for access control
        if (entry.dynamicImports) {
          for (const imp of entry.dynamicImports) {
            const sub = manifest[imp]
            if (sub) {
              js.push(sub.file)
              const nested = collectFiles(imp, visited)
              js.push(...nested.js)
              css.push(...nested.css)
              assets.push(...nested.assets)
            }
          }
        }

        return {
          js: [...new Set(js)],
          css: [...new Set(css)],
          assets: [...new Set(assets)],
          preloads: [...new Set(preloads)],
        }
      }

      const ciManifest: CIManifest = { entries: {}, fileAccess: {} }

      // Track which entries each file belongs to
      const fileEntryMap = new Map<string, Set<string>>()

      function trackFile(file: string, entryName: string) {
        if (!fileEntryMap.has(file)) fileEntryMap.set(file, new Set())
        fileEntryMap.get(file)!.add(entryName)
      }

      for (const [name, entryConfig] of Object.entries(config.entries)) {
        const manifestEntry = manifest[entryConfig.input]
        if (!manifestEntry) {
          console.warn(
            `[codeigniter] Entry "${name}" (${entryConfig.input}) not found in manifest`,
          )
          continue
        }

        const collected = collectFiles(entryConfig.input)
        const mainJs = [manifestEntry.file]
        // Merge CSS from the entry itself AND all imported chunks
        const allCss = [...new Set([...(manifestEntry.css ?? []), ...collected.css])]

        ciManifest.entries[name] = {
          input: entryConfig.input,
          access: entryConfig.access,
          groups: entryConfig.groups ?? [],
          permissions: entryConfig.permissions ?? [],
          files: { js: mainJs, css: allCss },
          chunks: collected.js,
          preloads: collected.preloads,
        }

        // Track all files belonging to this entry
        for (const f of [...mainJs, ...allCss, ...collected.js, ...collected.assets, ...collected.preloads]) {
          trackFile(f, name)
        }
      }

      // Determine effective access for each file:
      // If ANY public entry uses it → public. Otherwise → most permissive auth entry.
      for (const [file, entryNames] of fileEntryMap) {
        let effectiveAccess: EntryAccess = {
          access: 'auth',
          groups: [],
          permissions: [],
        }

        let hasPublic = false
        for (const eName of entryNames) {
          const entryCfg = config.entries[eName]
          if (entryCfg.access === 'public') {
            hasPublic = true
            break
          }
        }

        if (hasPublic) {
          effectiveAccess = { access: 'public', groups: [], permissions: [] }
        } else {
          // All entries are auth — merge groups/permissions (union)
          const groups = new Set<string>()
          const perms = new Set<string>()
          for (const eName of entryNames) {
            const entryCfg = config.entries[eName]
            for (const g of entryCfg.groups ?? []) groups.add(g)
            for (const p of entryCfg.permissions ?? []) perms.add(p)
          }
          effectiveAccess = {
            access: 'auth',
            groups: [...groups],
            permissions: [...perms],
          }
        }

        ciManifest.fileAccess[file] = effectiveAccess
      }

      fs.writeFileSync(
        path.resolve(buildPath, 'ci-manifest.json'),
        JSON.stringify(ciManifest, null, 2),
      )

      // Remove hot file after build (production mode)
      try {
        if (fs.existsSync(path.resolve(hotFilePath))) {
          fs.rmSync(path.resolve(hotFilePath))
        }
      } catch {
        /* ignore */
      }

      console.log(
        `\n[codeigniter] ci-manifest.json written with ${Object.keys(ciManifest.entries).length} entries\n`,
      )
    },
  }
}
