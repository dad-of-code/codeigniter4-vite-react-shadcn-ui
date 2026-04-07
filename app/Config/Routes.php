<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// ── Public React SPA (login, landing, etc.) ──
$routes->get('/', 'Home::index');
$routes->get('demo/(:any)', 'Home::index');

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

// ── Modular Route Files ──
// Each module registers its own routes from app/Routes/
\App\Routes\Dashboard\DashboardRoutes::registerRoutes($routes);

if (config('App')->shieldEnabled) {

    // Shield's built-in routes (login/register views for non-SPA fallback)
    service('auth')->routes($routes);

    // ── Auth API (JSON) — registered from route file ──
    \App\Routes\Auth\AuthRoutes::registerRoutes($routes);

    // Protected API routes (require authentication)
    $routes->group('api', ['namespace' => 'App\Controllers\Api', 'filter' => 'session'], static function ($routes) {
        // GET /api/user — current user info (legacy, prefer /api/auth/user)
        $routes->get('user', 'ApiController::user');

        // Add your authenticated API routes here:
        // $routes->resource('posts', ['controller' => 'PostsController']);
    });
}
