<?php

namespace App\Controllers;

class Home extends BaseController
{
    /**
     * Public React SPA — login, landing page, public content.
     */
    public function index(): string
    {
        return view('react/index', [
            'entry' => 'index',
            'title' => 'Home',
        ]);
    }

    /**
     * Authenticated React SPA — dashboard, settings, etc.
     * Shield's session filter (applied in Config\Filters) ensures
     * only logged-in users reach this method.
     */
    public function app(): string
    {
        return view('react/protected', [
            'entry' => 'protected',
            'title' => 'Dashboard',
        ]);
    }
}
