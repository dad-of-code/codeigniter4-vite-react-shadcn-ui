<?php

namespace Config;

use CodeIgniter\Settings\Config\Settings as BaseSettings;

/**
 * Settings Configuration
 *
 * Override the default settings handler list so the database handler
 * is only active when Shield (and a working database) is available.
 *
 * Without this, the `setting()` helper always tries to query the
 * `settings` table — which fails before the user has configured a
 * database connection.
 */
class Settings extends BaseSettings
{
    public function __construct()
    {
        parent::__construct();

        // Only register the database handler when Shield is enabled.
        // This prevents any `setting()` call from touching the DB
        // before the user has run migrations.
        if (! config('App')->shieldEnabled) {
            $this->handlers = array_values(
                array_filter($this->handlers, static fn ($h) => $h !== 'database'),
            );
        }
    }
}
