<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * First-time project setup after composer create-project.
 *
 * Copies the env template, sets development mode, detects a JS
 * package manager, installs Node dependencies, and builds the
 * front-end assets so the project is ready to run immediately.
 *
 * Usage:
 *   php spark app:setup
 *   php spark app:setup --no-frontend
 */
class AppSetup extends BaseCommand
{
    protected $group       = 'App';
    protected $name        = 'app:setup';
    protected $description = 'Run first-time project setup (env, deps, frontend build)';
    protected $usage       = 'app:setup [--no-frontend]';

    protected $options = [
        '--no-frontend' => 'Skip Node dependency install and Vite build',
    ];

    public function run(array $params)
    {
        CLI::newLine();
        CLI::write('╔══════════════════════════════════════════════════╗', 'green');
        CLI::write('║   CI4 + Vite + React — Project Setup             ║', 'green');
        CLI::write('╚══════════════════════════════════════════════════╝', 'green');
        CLI::newLine();

        // ── 1. Environment file ────────────────────────────────
        $this->setupEnvFile();

        // ── 2. Encryption key ──────────────────────────────────
        $this->generateEncryptionKey();

        // ── 3. Frontend dependencies ───────────────────────────
        $skipFrontend = array_key_exists('no-frontend', $params) || CLI::getOption('no-frontend');

        if (! $skipFrontend) {
            $this->installFrontend();
        } else {
            CLI::write('Skipping frontend setup (--no-frontend).', 'yellow');
            CLI::newLine();
        }

        // ── 4. Summary ────────────────────────────────────────
        $this->printNextSteps($skipFrontend);
    }

    /**
     * Copy `env` → `.env` and switch to development mode.
     */
    private function setupEnvFile(): void
    {
        $root    = ROOTPATH;
        $envFile = $root . '.env';
        $envTpl  = $root . 'env';

        if (is_file($envFile)) {
            CLI::write('✓ .env already exists — skipping.', 'green');
            CLI::newLine();
            return;
        }

        if (! is_file($envTpl)) {
            CLI::error('env template not found at: ' . $envTpl);
            return;
        }

        copy($envTpl, $envFile);
        CLI::write('✓ Created .env from template.', 'green');

        // Uncomment CI_ENVIRONMENT and set to development
        $contents = file_get_contents($envFile);
        $contents = preg_replace(
            '/^#\s*CI_ENVIRONMENT\s*=\s*production$/m',
            'CI_ENVIRONMENT = development',
            $contents,
        );
        file_put_contents($envFile, $contents);
        CLI::write('✓ Set CI_ENVIRONMENT = development', 'green');
        CLI::newLine();
    }

    /**
     * Generate an encryption key via the built-in spark command.
     */
    private function generateEncryptionKey(): void
    {
        $envFile = ROOTPATH . '.env';

        if (! is_file($envFile)) {
            CLI::write('⚠ No .env file — skipping key generation.', 'yellow');
            CLI::newLine();
            return;
        }

        // Check if a key is already set
        $contents = file_get_contents($envFile);
        if (preg_match('/^\s*encryption\.key\s*=\s*\S+/m', $contents)) {
            CLI::write('✓ Encryption key already set — skipping.', 'green');
            CLI::newLine();
            return;
        }

        CLI::write('Generating encryption key...', 'yellow');

        try {
            $this->call('key:generate');
            CLI::write('✓ Encryption key generated.', 'green');
        } catch (\Throwable $e) {
            CLI::write('⚠ Could not generate encryption key — run "php spark key:generate" manually.', 'yellow');
        }

        CLI::newLine();
    }

    /**
     * Detect a JS package manager, install deps, and build assets.
     */
    private function installFrontend(): void
    {
        $npm = $this->detectPackageManager();

        if ($npm === null) {
            CLI::write('⚠ No Node.js package manager found (pnpm, npm, yarn).', 'yellow');
            CLI::write('  Install Node.js then run:', 'light_gray');
            CLI::write('    pnpm install && pnpm run build', 'white');
            CLI::newLine();
            return;
        }

        CLI::write("Using {$npm} as the package manager.", 'yellow');
        CLI::newLine();

        // Install dependencies
        CLI::write('Installing Node dependencies...', 'yellow');
        $exitCode = null;
        passthru("{$npm} install", $exitCode);

        if ($exitCode !== 0) {
            CLI::error("{$npm} install failed (exit {$exitCode}). Run it manually.");
            return;
        }

        CLI::newLine();
        CLI::write('✓ Node dependencies installed.', 'green');
        CLI::newLine();

        // Build front-end assets
        CLI::write('Building front-end assets...', 'yellow');
        passthru("{$npm} run build", $exitCode);

        if ($exitCode !== 0) {
            CLI::error("{$npm} run build failed (exit {$exitCode}). Run it manually.");
            return;
        }

        CLI::newLine();
        CLI::write('✓ Front-end assets built.', 'green');
        CLI::newLine();
    }

    /**
     * Detect an available JS package manager in order of preference.
     */
    private function detectPackageManager(): ?string
    {
        // Prefer the manager whose lockfile exists in the project root
        $lockMap = [
            'pnpm-lock.yaml'    => 'pnpm',
            'yarn.lock'         => 'yarn',
            'package-lock.json' => 'npm',
            'bun.lockb'         => 'bun',
        ];

        foreach ($lockMap as $lockFile => $cmd) {
            if (is_file(ROOTPATH . $lockFile) && $this->commandExists($cmd)) {
                return $cmd;
            }
        }

        // Fall back to whatever is installed
        foreach (['pnpm', 'yarn', 'npm'] as $cmd) {
            if ($this->commandExists($cmd)) {
                return $cmd;
            }
        }

        return null;
    }

    /**
     * Check whether a CLI command is available on this system.
     */
    private function commandExists(string $command): bool
    {
        $check = PHP_OS_FAMILY === 'Windows'
            ? "where {$command} 2>NUL"
            : "command -v {$command} 2>/dev/null";

        exec($check, $output, $exitCode);

        return $exitCode === 0;
    }

    /**
     * Print the "what to do next" guide.
     */
    private function printNextSteps(bool $skippedFrontend): void
    {
        CLI::write('╔══════════════════════════════════════════════════╗', 'green');
        CLI::write('║   Setup Complete!                                ║', 'green');
        CLI::write('╚══════════════════════════════════════════════════╝', 'green');
        CLI::newLine();

        CLI::write('Next steps:', 'yellow');
        CLI::newLine();

        $step = 1;

        CLI::write("  {$step}. Configure your database in .env", 'white');
        $step++;

        CLI::write("  {$step}. Run migrations:  php spark migrate --all", 'white');
        $step++;

        CLI::write("  {$step}. Enable Shield auth:  set app.shieldEnabled = true in .env", 'white');
        $step++;

        if ($skippedFrontend) {
            CLI::write("  {$step}. Install JS deps:  pnpm install", 'white');
            $step++;

            CLI::write("  {$step}. Build assets:  pnpm run build", 'white');
            $step++;
        }

        CLI::write("  {$step}. Start development:", 'white');
        CLI::write('       Terminal 1:  php spark serve', 'light_gray');
        CLI::write('       Terminal 2:  pnpm run dev', 'light_gray');
        CLI::newLine();
    }
}
