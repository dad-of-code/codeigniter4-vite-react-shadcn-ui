<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Base API controller with JSON response helpers.
 *
 * All /api routes are served by controllers in this namespace.
 * In dev mode Vite proxies /api → CI4, so the React frontend
 * can call fetch('/api/...') without worrying about CORS or ports.
 */
class ApiController extends BaseController
{
    /**
     * GET /api/health
     * Public health check endpoint.
     */
    public function health(): ResponseInterface
    {
        return $this->response->setJSON([
            'status' => 'ok',
            'timestamp' => date('c'),
            'environment' => ENVIRONMENT,
        ]);
    }

    /**
     * GET /api/user
     * Returns the current authenticated user's info.
     * Protected by the session filter in Routes.php.
     */
    public function user(): ResponseInterface
    {
        $user = auth()->user();

        if (! $user) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON(['error' => 'Not authenticated']);
        }

        return $this->response->setJSON([
            'id'       => $user->id,
            'username' => $user->username,
            'email'    => $user->email,
            'groups'   => $user->getGroups(),
        ]);
    }
}
