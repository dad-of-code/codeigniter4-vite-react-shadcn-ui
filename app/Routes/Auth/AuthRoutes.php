<?php

namespace App\Routes\Auth;

use CodeIgniter\Router\RouteCollection;

/**
 * Auth Routes
 *
 * Registers authentication-related API routes.
 * Called from app/Config/Routes.php
 *
 * @package App\Routes\Auth
 */
class AuthRoutes
{
    /**
     * Register Auth routes for the application
     *
     * @param RouteCollection $routes
     * @param string $base_uri
     * @return void
     */
    public static function registerRoutes(RouteCollection $routes, string $base_uri = 'api/auth'): void
    {
        $routes->group($base_uri, ['namespace' => 'App\Controllers\Api'], static function ($routes) {
            $routes->post('login', 'AuthController::login');
            $routes->post('register', 'AuthController::register');
            $routes->post('logout', 'AuthController::logout');
            $routes->get('user', 'AuthController::user');
        });
    }
}
