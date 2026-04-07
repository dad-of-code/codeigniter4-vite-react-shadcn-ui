<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * One-command Shield setup: runs migrations, seeds a default admin,
 * and enables Shield in .env.
 *
 * Usage:
 *   php spark shield:install
 *   php spark shield:install --no-seed
 */
class ShieldInstall extends BaseCommand
{
    protected $group       = 'Shield';
    protected $name        = 'shield:install';
    protected $description = 'Run Shield migrations, seed an admin, and enable auth';
    protected $usage       = 'shield:install [--no-seed]';

    protected $options = [
        '--no-seed' => 'Skip seeding the default admin account',
    ];

    public function run(array $params)
    {
        CLI::newLine();
        CLI::write('╔══════════════════════════════════════════════════╗', 'green');
        CLI::write('║   Shield Authentication Setup                    ║', 'green');
        CLI::write('╚══════════════════════════════════════════════════╝', 'green');
        CLI::newLine();

        // ── 1. Verify .env exists ─────────────────────────────
        if (! is_file(ROOTPATH . '.env')) {
            CLI::error('.env file not found. Run "php spark app:setup" first.');
            return;
        }

        // ── 2. Verify database is reachable ───────────────────
        if (! $this->checkDatabase()) {
            return;
        }

        // ── 3. Run migrations ─────────────────────────────────
        $this->runMigrations();

        // ── 4. Seed default admin ─────────────────────────────
        $skipSeed = array_key_exists('no-seed', $params) || CLI::getOption('no-seed');

        if (! $skipSeed) {
            $this->seedAdmin();
        } else {
            CLI::write('Skipping admin seeder (--no-seed).', 'yellow');
            CLI::newLine();
        }

        // ── 5. Enable Shield in .env ──────────────────────────
        $this->enableShield();

        // ── 6. Summary ────────────────────────────────────────
        $this->printSummary($skipSeed);
    }

    /**
     * Verify the database connection works.
     */
    private function checkDatabase(): bool
    {
        CLI::write('Checking database connection...', 'yellow');

        try {
            $db = \Config\Database::connect();
            $db->initialize();

            CLI::write('✓ Database connection OK.', 'green');
            CLI::newLine();

            return true;
        } catch (\CodeIgniter\Database\Exceptions\DatabaseException $e) {
            CLI::error('Cannot connect to the database.');
            CLI::write('  ' . $e->getMessage(), 'light_gray');
            CLI::newLine();
            CLI::write('Configure your database in .env first:', 'yellow');
            CLI::write('  database.default.hostname = localhost', 'white');
            CLI::write('  database.default.database = your_db', 'white');
            CLI::write('  database.default.username = root', 'white');
            CLI::write('  database.default.password = secret', 'white');
            CLI::write('  database.default.DBDriver = MySQLi', 'white');
            CLI::newLine();

            return false;
        }
    }

    /**
     * Run all migrations (framework + Shield).
     */
    private function runMigrations(): void
    {
        CLI::write('Running migrations...', 'yellow');

        try {
            $this->call('migrate', ['--all' => true]);
            CLI::write('✓ Migrations complete.', 'green');
        } catch (\Throwable $e) {
            CLI::error('Migration failed: ' . $e->getMessage());
        }

        CLI::newLine();
    }

    /**
     * Run the AdminSeeder.
     */
    private function seedAdmin(): void
    {
        CLI::write('Seeding default admin account...', 'yellow');

        try {
            $this->call('db:seed', ['AdminSeeder']);
            CLI::write('✓ Admin seeder complete.', 'green');
        } catch (\Throwable $e) {
            CLI::error('Seeder failed: ' . $e->getMessage());
        }

        CLI::newLine();
    }

    /**
     * Set app.shieldEnabled = true in .env.
     */
    private function enableShield(): void
    {
        $envFile  = ROOTPATH . '.env';
        $contents = file_get_contents($envFile);

        // Check if already enabled
        if (preg_match('/^\s*app\.shieldEnabled\s*=\s*true\s*$/m', $contents)) {
            CLI::write('✓ Shield already enabled in .env.', 'green');
            CLI::newLine();
            return;
        }

        // Replace the commented or false line
        if (preg_match('/^#?\s*app[._]shieldEnabled\s*=.*/m', $contents)) {
            $contents = preg_replace(
                '/^#?\s*app[._]shieldEnabled\s*=.*/m',
                'app.shieldEnabled = true',
                $contents,
            );
        } else {
            // Append if not present at all
            $contents .= "\napp.shieldEnabled = true\n";
        }

        file_put_contents($envFile, $contents);
        CLI::write('✓ Set app.shieldEnabled = true in .env', 'green');
        CLI::newLine();
    }

    /**
     * Print setup summary.
     */
    private function printSummary(bool $skippedSeed): void
    {
        CLI::write('╔══════════════════════════════════════════════════╗', 'green');
        CLI::write('║   Shield Setup Complete!                         ║', 'green');
        CLI::write('╚══════════════════════════════════════════════════╝', 'green');
        CLI::newLine();

        if (! $skippedSeed) {
            CLI::write('Default admin credentials:', 'yellow');
            CLI::write('  Email:    admin@example.com', 'white');
            CLI::write('  Password: changeme123', 'white');
            CLI::write('  ⚠ Change the password after first login!', 'light_red');
            CLI::newLine();
        }

        CLI::write('Auth API endpoints:', 'yellow');
        CLI::write('  POST /api/auth/login     — JSON login', 'white');
        CLI::write('  POST /api/auth/register  — JSON registration', 'white');
        CLI::write('  POST /api/auth/logout    — Logout', 'white');
        CLI::write('  GET  /api/auth/user      — Current user', 'white');
        CLI::newLine();

        CLI::write('Restart your PHP server for changes to take effect.', 'yellow');
        CLI::newLine();
    }
}
