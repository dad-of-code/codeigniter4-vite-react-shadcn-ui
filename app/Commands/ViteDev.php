<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * Start both the Vite dev server and CodeIgniter's built-in server
 * for local development.
 *
 * Ports default to the values in ci.config.ts but can be overridden
 * via command-line options.
 *
 * Usage:
 *   php spark vite:dev
 *   php spark vite:dev --port=8080 --vite-port=5173
 */
class ViteDev extends BaseCommand
{
    protected $group       = 'Vite';
    protected $name        = 'vite:dev';
    protected $description = 'Start CI4 + Vite dev servers for local development';
    protected $usage       = 'vite:dev [--port=8080] [--vite-port=5173] [--npm=pnpm]';

    protected $options = [
        '--port'      => 'CI4 server port (default: read from ci.config.ts, fallback 8080)',
        '--vite-port' => 'Vite dev server port (default: read from ci.config.ts, fallback 5173)',
        '--npm'       => 'Package manager command (default: pnpm)',
    ];

    public function run(array $params)
    {
        // Try to read ports from ci.config.ts as the single source of truth
        $defaults = $this->readCiConfig();

        $ciPort   = $params['port'] ?? CLI::getOption('port') ?? $defaults['ciPort'] ?? '8080';
        $vitePort = $params['vite-port'] ?? CLI::getOption('vite-port') ?? $defaults['vitePort'] ?? '5173';
        $npm      = $params['npm'] ?? CLI::getOption('npm') ?? 'pnpm';

        CLI::write('Starting development servers...', 'yellow');
        CLI::write("  CI4:  http://localhost:{$ciPort}", 'green');
        CLI::write("  Vite: http://localhost:{$vitePort}", 'green');
        CLI::write("  API:  http://localhost:{$vitePort}/api → CI4:{$ciPort}", 'green');
        CLI::newLine();
        CLI::write('Press Ctrl+C to stop both servers.', 'light_gray');
        CLI::newLine();

        // Use the platform-appropriate way to run both processes
        if (DIRECTORY_SEPARATOR === '\\') {
            // Windows: use start /B for background processes
            $cmd = "start /B {$npm} run dev -- --port={$vitePort} & php spark serve --port={$ciPort}";
            passthru($cmd);
        } else {
            // Unix: background the Vite server, foreground CI4
            $cmd = "{$npm} run dev -- --port={$vitePort} & php spark serve --port={$ciPort}";
            passthru($cmd);
        }
    }

    /**
     * Parse ci.config.ts to extract port defaults.
     * Intentionally simple regex so there's no Node dependency.
     */
    protected function readCiConfig(): array
    {
        $configPath = ROOTPATH . 'ci.config.ts';
        $defaults   = [];

        if (! is_file($configPath)) {
            return $defaults;
        }

        $content = file_get_contents($configPath);

        if (preg_match('/ciPort\s*:\s*(\d+)/', $content, $m)) {
            $defaults['ciPort'] = $m[1];
        }
        if (preg_match('/vitePort\s*:\s*(\d+)/', $content, $m)) {
            $defaults['vitePort'] = $m[1];
        }

        return $defaults;
    }
}
