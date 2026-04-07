<?php

namespace App\Routes\Dashboard;

use CodeIgniter\Router\RouteCollection;

/**
 * Dashboard Routes
 *
 * Registers dashboard-related API routes.
 * Called from app/Config/Routes.php
 *
 * @package App\Routes\Dashboard
 */
class DashboardRoutes
{
    /**
     * Register Dashboard routes for the application
     *
     * @param RouteCollection $routes
     * @param string $base_uri
     * @return void
     */
    public static function registerRoutes(RouteCollection $routes, string $base_uri = 'api/dashboard'): void
    {
        $routes->group($base_uri, ['namespace' => 'App\Controllers\Api', 'filter' => 'session'], static function ($routes) {
            // Add dashboard-specific API routes here
            // $routes->get('stats', 'DashboardController::stats');
        });
    }
}
