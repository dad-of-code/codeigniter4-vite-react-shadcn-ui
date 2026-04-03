<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// ── Public React SPA (login, landing, etc.) ──
$routes->get('/', 'Home::index');

// ── Authenticated React SPA (dashboard, settings, etc.) ──
// Catches /app and /app/anything so React Router handles sub-routes.
$routes->get('app', 'Home::app');
$routes->get('app/(:any)', 'Home::app');

// ── Vite built-asset serving with MIME + access control ──
$routes->get('build/(:any)', 'AssetController::serve/$1');

// ── Backend API ──
// All API routes live under /api. The React frontend calls these
// endpoints (Vite proxies /api → CI4 in dev mode).
$routes->group('api', ['namespace' => 'App\Controllers\Api'], static function ($routes) {
    // Health check — GET /api/health
    $routes->get('health', 'ApiController::health');
});

if (config('App')->shieldEnabled) {

    service('auth')->routes($routes);

    // Protected API routes (require authentication)
    $routes->group('', ['filter' => 'session'], static function ($routes) {
        // GET /api/user — current user info
        $routes->get('user', 'ApiController::user');

        // Add your authenticated API routes here:
        // $routes->resource('posts', ['controller' => 'PostsController']);
    });
}
