<?php

/**
 * Vite Helper
 *
 * Provides convenient functions for including Vite-built assets
 * in CodeIgniter 4 views.
 *
 * Load with:  helper('vite');
 */

use App\Libraries\ViteAssets;

if (! function_exists('ci_vite')) {
    /**
     * Output all <script> and <link> tags for a named Vite entry.
     *
     * @param string $entry Entry name as defined in vite.config.ts (e.g. 'index', 'protected')
     */
    function ci_vite(string $entry): string
    {
        /** @var ViteAssets $vite */
        static $vite;
        $vite ??= new ViteAssets();

        return $vite->tags($entry);
    }
}

if (! function_exists('ci_vite_css')) {
    /**
     * Output only CSS <link> tags for a named Vite entry.
     */
    function ci_vite_css(string $entry): string
    {
        static $vite;
        $vite ??= new ViteAssets();

        return $vite->cssTags($entry);
    }
}

if (! function_exists('ci_vite_js')) {
    /**
     * Output only JS <script> tags (with preload hints) for a named Vite entry.
     */
    function ci_vite_js(string $entry): string
    {
        static $vite;
        $vite ??= new ViteAssets();

        return $vite->jsTags($entry);
    }
}

if (! function_exists('ci_vite_is_dev')) {
    /**
     * Check whether the Vite dev server is currently running.
     */
    function ci_vite_is_dev(): bool
    {
        static $vite;
        $vite ??= new ViteAssets();

        return $vite->isDevMode();
    }
}
