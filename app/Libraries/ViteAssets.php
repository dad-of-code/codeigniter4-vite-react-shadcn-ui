<?php

namespace App\Libraries;

use Config\Vite as ViteConfig;

/**
 * ViteAssets — reads the Vite manifest and generates HTML tags.
 *
 * In development (hot file present) it points to the Vite dev server.
 * In production it reads ci-manifest.json and outputs fingerprinted URLs
 * routed through the AssetController for MIME + access-control support.
 */
class ViteAssets
{
    protected ViteConfig $config;

    /** Parsed ci-manifest.json (cached per-request) */
    protected ?array $manifest = null;

    /** Contents of the hot file, or null if not in dev mode */
    protected ?string $devServerUrl = null;

    /** Whether we already checked for dev mode */
    protected bool $devModeChecked = false;

    public function __construct(?ViteConfig $config = null)
    {
        $this->config = $config ?? config('Vite');
    }

    // ------------------------------------------------------------------
    //  Public API
    // ------------------------------------------------------------------

    /**
     * Generate all <script> and <link> tags for a named entry.
     *
     * Usage in a view:  <?= ci_vite('index') ?>
     */
    public function tags(string $entry): string
    {
        if ($this->isDevMode()) {
            return $this->devTags($entry);
        }

        return $this->productionTags($entry);
    }

    /**
     * Return only CSS <link> tags for the entry.
     */
    public function cssTags(string $entry): string
    {
        if ($this->isDevMode()) {
            return ''; // Vite injects CSS via JS in dev mode
        }

        $manifest = $this->loadManifest();
        if (! isset($manifest['entries'][$entry])) {
            return "<!-- ci_vite: entry \"{$entry}\" not found -->\n";
        }

        $e   = $manifest['entries'][$entry];
        $out = '';

        foreach ($e['files']['css'] ?? [] as $file) {
            $out .= $this->cssTag($file);
        }

        return $out;
    }

    /**
     * Return only JS <script> tags (with modulepreload hints) for the entry.
     */
    public function jsTags(string $entry): string
    {
        if ($this->isDevMode()) {
            return $this->devTags($entry);
        }

        $manifest = $this->loadManifest();
        if (! isset($manifest['entries'][$entry])) {
            return "<!-- ci_vite: entry \"{$entry}\" not found -->\n";
        }

        $e   = $manifest['entries'][$entry];
        $out = '';

        // Preload shared chunks
        foreach ($e['preloads'] ?? [] as $file) {
            $out .= $this->preloadTag($file);
        }

        // Main JS
        foreach ($e['files']['js'] ?? [] as $file) {
            $out .= $this->scriptTag($file);
        }

        return $out;
    }

    /**
     * Check whether the Vite dev server is running.
     */
    public function isDevMode(): bool
    {
        if (! $this->devModeChecked) {
            $this->devModeChecked = true;
            $hotPath = rtrim($this->config->buildPath, '/\\') . DIRECTORY_SEPARATOR . $this->config->hotFile;

            if ($this->config->forceDevMode) {
                $this->devServerUrl = $this->config->devServerUrl;
            } elseif (is_file($hotPath)) {
                $this->devServerUrl = trim(file_get_contents($hotPath));
            }
        }

        return $this->devServerUrl !== null;
    }

    /**
     * Return the parsed ci-manifest.json or null.
     */
    public function getManifest(): ?array
    {
        return $this->loadManifest();
    }

    /**
     * Resolve the access rule for a given output file path.
     * Returns ['access' => 'public'|'auth', 'groups' => [...], 'permissions' => [...]]
     */
    public function fileAccess(string $filePath): ?array
    {
        $manifest = $this->loadManifest();
        return $manifest['fileAccess'][$filePath] ?? null;
    }

    // ------------------------------------------------------------------
    //  Internals
    // ------------------------------------------------------------------

    protected function loadManifest(): ?array
    {
        if ($this->manifest !== null || ! $this->config->cacheManifest) {
            return $this->manifest;
        }

        $path = rtrim($this->config->buildPath, '/\\')
            . DIRECTORY_SEPARATOR
            . $this->config->manifestFile;

        if (! is_file($path)) {
            return null;
        }

        $this->manifest = json_decode(file_get_contents($path), true);
        return $this->manifest;
    }

    /**
     * Tags for dev mode — point to Vite dev server.
     */
    protected function devTags(string $entry): string
    {
        $manifest = $this->loadManifest();
        $input    = null;

        // Try to resolve the input path from ci-manifest
        if ($manifest && isset($manifest['entries'][$entry]['input'])) {
            $input = $manifest['entries'][$entry]['input'];
        }

        // Fallback: conventional paths
        if ($input === null) {
            $conventions = [
                "src/{$entry}.tsx",
                "src/{$entry}.ts",
                "src/{$entry}.jsx",
                "src/{$entry}.js",
            ];
            // In dev mode without a manifest, just use the first convention
            $input = $conventions[0];
        }

        $base = rtrim($this->devServerUrl, '/');

        // 1. Vite client (HMR websocket, CSS injection, etc.)
        $out  = '<script type="module" src="' . esc($base . '/@vite/client', 'attr') . '"></script>' . "\n";

        // 2. React Fast Refresh preamble — must run BEFORE any component modules.
        //    @vitejs/plugin-react injects `import RefreshRuntime` into every module,
        //    but the runtime must be installed globally first. When Vite serves its
        //    own index.html this happens automatically; when CI4 serves the HTML
        //    we need to bootstrap it ourselves.
        //    Note: The import URL must NOT be HTML-escaped — it's inside a JS context.
        $refreshUrl = $base . '/@react-refresh';
        $out .= '<script type="module">' . "\n";
        $out .= 'import RefreshRuntime from "' . $refreshUrl . '";' . "\n";
        $out .= 'RefreshRuntime.injectIntoGlobalHook(window);' . "\n";
        $out .= 'window.$RefreshReg$ = () => {};' . "\n";
        $out .= 'window.$RefreshSig$ = () => (type) => type;' . "\n";
        $out .= 'window.__vite_plugin_react_preamble_installed__ = true;' . "\n";
        $out .= '</script>' . "\n";

        // 3. Entry module
        $out .= '<script type="module" src="' . esc($base . '/' . $input, 'attr') . '"></script>' . "\n";

        return $out;
    }

    /**
     * Full production tags (CSS + preloads + JS).
     */
    protected function productionTags(string $entry): string
    {
        $manifest = $this->loadManifest();
        if (! $manifest || ! isset($manifest['entries'][$entry])) {
            return "<!-- ci_vite: entry \"{$entry}\" not found in ci-manifest.json -->\n";
        }

        $e   = $manifest['entries'][$entry];
        $out = '';

        // CSS
        foreach ($e['files']['css'] ?? [] as $file) {
            $out .= $this->cssTag($file);
        }

        // Preload shared chunks
        foreach ($e['preloads'] ?? [] as $file) {
            $out .= $this->preloadTag($file);
        }

        // JS
        foreach ($e['files']['js'] ?? [] as $file) {
            $out .= $this->scriptTag($file);
        }

        return $out;
    }

    protected function assetUrl(string $file): string
    {
        return rtrim($this->config->assetUrlPrefix, '/') . '/' . ltrim($file, '/');
    }

    protected function scriptTag(string $file): string
    {
        return '<script type="module" src="' . esc($this->assetUrl($file), 'attr') . '"></script>' . "\n";
    }

    protected function cssTag(string $file): string
    {
        return '<link rel="stylesheet" href="' . esc($this->assetUrl($file), 'attr') . '">' . "\n";
    }

    protected function preloadTag(string $file): string
    {
        return '<link rel="modulepreload" href="' . esc($this->assetUrl($file), 'attr') . '">' . "\n";
    }
}
