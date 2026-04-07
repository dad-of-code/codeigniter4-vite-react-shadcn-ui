<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Shield\Authentication\Authenticators\Session;
use CodeIgniter\Shield\Validation\ValidationRules;

/**
 * JSON API controller for Shield authentication.
 *
 * Provides login, register, logout, and user endpoints that return
 * JSON responses instead of redirects — designed for React SPAs
 * that call fetch('/api/auth/...') from the frontend.
 *
 * All endpoints use the same Shield session authenticator under the
 * hood, so cookies/sessions work identically to Shield's built-in
 * controllers. The only difference is the response format.
 */
class AuthController extends BaseController
{
    /**
     * POST /api/auth/login
     *
     * Body: { "email": "...", "password": "...", "remember": true|false }
     */
    public function login(): ResponseInterface
    {
        // Already logged in?
        if (auth()->loggedIn()) {
            return $this->respondWith(200, 'Already authenticated.', $this->userData());
        }

        // Validate input
        $rules = (new ValidationRules())->getLoginRules();

        if (! $this->validateData($this->request->getJSON(true) ?? [], $rules, [], config('Auth')->DBGroup)) {
            return $this->respondWith(422, 'Validation failed.', null, $this->validator->getErrors());
        }

        $body        = $this->request->getJSON(true);
        $credentials = array_intersect_key($body, array_flip(setting('Auth.validFields')));
        $credentials = array_filter($credentials);
        $credentials['password'] = $body['password'] ?? '';
        $remember    = (bool) ($body['remember'] ?? false);

        /** @var Session $authenticator */
        $authenticator = auth('session')->getAuthenticator();

        $result = $authenticator->remember($remember)->attempt($credentials);

        if (! $result->isOK()) {
            return $this->respondWith(401, $result->reason());
        }

        // If an action is required (e.g. 2FA, email verify) after login
        if ($authenticator->hasAction()) {
            return $this->respondWith(403, 'Additional verification required.', [
                'action' => true,
            ]);
        }

        return $this->respondWith(200, 'Login successful.', $this->userData());
    }

    /**
     * POST /api/auth/register
     *
     * Body: { "username": "...", "email": "...", "password": "...", "password_confirm": "..." }
     */
    public function register(): ResponseInterface
    {
        if (auth()->loggedIn()) {
            return $this->respondWith(200, 'Already authenticated.', $this->userData());
        }

        if (! setting('Auth.allowRegistration')) {
            return $this->respondWith(403, 'Registration is disabled.');
        }

        $rules = (new ValidationRules())->getRegistrationRules();

        $body = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($body, $rules, [], config('Auth')->DBGroup)) {
            return $this->respondWith(422, 'Validation failed.', null, $this->validator->getErrors());
        }

        $users = model(setting('Auth.userProvider'));

        $allowedFields = array_keys($rules);
        $user          = $users->createNewUser(
            array_intersect_key($body, array_flip($allowedFields)),
        );

        if ($user->username === null) {
            $user->username = null;
        }

        try {
            $users->save($user);
        } catch (\CodeIgniter\Shield\Exceptions\ValidationException) {
            return $this->respondWith(422, 'Validation failed.', null, $users->errors());
        }

        $user = $users->findById($users->getInsertID());
        $users->addToDefaultGroup($user);

        \CodeIgniter\Events\Events::trigger('register', $user);

        /** @var Session $authenticator */
        $authenticator = auth('session')->getAuthenticator();
        $authenticator->startLogin($user);

        $hasAction = $authenticator->startUpAction('register', $user);
        if ($hasAction) {
            return $this->respondWith(403, 'Additional verification required.', [
                'action' => true,
            ]);
        }

        $user->activate();
        $authenticator->completeLogin($user);

        return $this->respondWith(201, 'Registration successful.', $this->userData());
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(): ResponseInterface
    {
        auth()->logout();

        return $this->respondWith(200, 'Logged out.');
    }

    /**
     * GET /api/auth/user
     *
     * Returns the currently authenticated user, or 401.
     */
    public function user(): ResponseInterface
    {
        if (! auth()->loggedIn()) {
            return $this->respondWith(401, 'Not authenticated.');
        }

        return $this->respondWith(200, 'Authenticated.', $this->userData());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * Build a consistent JSON envelope.
     */
    private function respondWith(
        int $status,
        string $message,
        ?array $data = null,
        ?array $errors = null,
    ): ResponseInterface {
        $body = ['message' => $message];

        if ($data !== null) {
            $body['data'] = $data;
        }

        if ($errors !== null) {
            $body['errors'] = $errors;
        }

        return $this->response
            ->setStatusCode($status)
            ->setJSON($body);
    }

    /**
     * Serialize the current user for JSON responses.
     */
    private function userData(): array
    {
        $user = auth()->user();

        return [
            'id'       => $user->id,
            'username' => $user->username,
            'email'    => $user->email,
            'groups'   => $user->getGroups(),
        ];
    }
}
