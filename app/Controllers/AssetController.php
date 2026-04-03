<?php

namespace App\Controllers;

use App\Libraries\ViteAssets;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Mimes;
use Config\Vite as ViteConfig;

/**
 * Serves Vite-built assets from the writable directory with
 * correct MIME types and access-control enforcement.
 *
 * In production every chunk is resolved against ci-manifest.json;
 * files belonging to a protected entry require the caller to be
 * authenticated (and optionally in the right group/permission).
 */
class AssetController extends BaseController
{
    /**
     * Serve a built asset file.
     *
     * Route: /build/(.+)  →  AssetController::serve/$1
     */
    public function serve(string ...$segments): ResponseInterface
    {
        $relativePath = implode('/', $segments);

        // Prevent directory traversal
        if (str_contains($relativePath, '..') || str_contains($relativePath, "\0")) {
            return $this->response->setStatusCode(400);
        }

        /** @var ViteConfig $config */
        $config  = config('Vite');
        $absPath = rtrim($config->buildPath, '/\\') . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);

        if (! is_file($absPath)) {
            return $this->response->setStatusCode(404);
        }

        // ---- Access control via ci-manifest.json ---- //
        $vite   = new ViteAssets($config);
        $access = $vite->fileAccess($relativePath);

        if ($access !== null && $access['access'] !== 'public' && config('App')->shieldEnabled) {
            // Require authentication (Shield must be enabled and DB configured)
            $auth = service('auth');
            if (! $auth->loggedIn()) {
                return $this->response->setStatusCode(403);
            }

            $user = $auth->user();

            // Group check — user must be in at least one of the listed groups
            if (! empty($access['groups'])) {
                $inGroup = false;
                foreach ($access['groups'] as $group) {
                    if ($user->inGroup($group)) {
                        $inGroup = true;
                        break;
                    }
                }
                if (! $inGroup) {
                    return $this->response->setStatusCode(403);
                }
            }

            // Permission check — user must hold at least one of the listed permissions
            if (! empty($access['permissions'])) {
                $hasPermission = false;
                foreach ($access['permissions'] as $perm) {
                    if ($user->can($perm)) {
                        $hasPermission = true;
                        break;
                    }
                }
                if (! $hasPermission) {
                    return $this->response->setStatusCode(403);
                }
            }
        }

        // ---- Serve the file ---- //
        $mime = $this->detectMime($absPath, $relativePath);

        return $this->response
            ->setStatusCode(200)
            ->setContentType($mime)
            ->setHeader('Cache-Control', $this->cacheControl())
            ->setHeader('Accept-Ranges', 'none')
            ->setBody(file_get_contents($absPath));
    }

    // ------------------------------------------------------------------

    /**
     * Detect MIME by extension, with sensible defaults for JS/CSS/SVG/map.
     */
    protected function detectMime(string $absPath, string $relativePath): string
    {
        $ext = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));

        $map = [
            'js'    => 'application/javascript',
            'mjs'   => 'application/javascript',
            'css'   => 'text/css',
            'svg'   => 'image/svg+xml',
            'json'  => 'application/json',
            'map'   => 'application/json',
            'woff'  => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf'   => 'font/ttf',
            'eot'   => 'application/vnd.ms-fontobject',
            'png'   => 'image/png',
            'jpg'   => 'image/jpeg',
            'jpeg'  => 'image/jpeg',
            'gif'   => 'image/gif',
            'webp'  => 'image/webp',
            'avif'  => 'image/avif',
            'ico'   => 'image/x-icon',
            'webm'  => 'video/webm',
            'mp4'   => 'video/mp4',
        ];

        if (isset($map[$ext])) {
            return $map[$ext];
        }

        // Fall back to CI4's Mimes config
        $mimeType = Mimes::guessTypeFromExtension($ext);
        return $mimeType ?? 'application/octet-stream';
    }

    /**
     * Cache policy: in production fingerprinted assets are immutable.
     */
    protected function cacheControl(): string
    {
        if (ENVIRONMENT === 'production') {
            return 'public, max-age=31536000, immutable';
        }

        return 'no-cache, no-store, must-revalidate';
    }
}
