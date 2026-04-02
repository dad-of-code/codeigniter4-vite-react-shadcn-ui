<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * Build Vite assets for production and validate the output.
 *
 * Usage:
 *   php spark vite:build
 *   php spark vite:build --npm=pnpm
 *   php spark vite:build --clean
 */
class ViteBuild extends BaseCommand
{
    protected $group       = 'Vite';
    protected $name        = 'vite:build';
    protected $description = 'Build Vite assets for production and generate ci-manifest.json';
    protected $usage       = 'vite:build [--npm=pnpm] [--clean]';

    protected $options = [
        '--npm'   => 'Package manager command (default: pnpm)',
        '--clean' => 'Remove the build directory before building',
    ];

    public function run(array $params)
    {
        $npm    = $params['npm'] ?? CLI::getOption('npm') ?? 'pnpm';
        $clean  = array_key_exists('clean', $params) || CLI::getOption('clean');
        $config = config('Vite');

        if ($clean && is_dir($config->buildPath)) {
            CLI::write('Cleaning build directory...', 'yellow');
            $this->deleteDirectory($config->buildPath);
            mkdir($config->buildPath, 0755, true);
        }

        // Run the Vite build
        CLI::write('Running Vite build...', 'yellow');
        CLI::newLine();

        $command = $npm . ' run build';
        $result  = null;
        passthru($command, $result);

        if ($result !== 0) {
            CLI::error('Vite build failed with exit code ' . $result);
            return;
        }

        CLI::newLine();

        // Validate output
        $manifestPath = rtrim($config->buildPath, '/\\') . DIRECTORY_SEPARATOR . $config->manifestFile;

        if (! is_file($manifestPath)) {
            CLI::error('ci-manifest.json was not generated.');
            CLI::write('Make sure vite-plugin-codeigniter is configured in vite.config.ts', 'light_gray');
            return;
        }

        $manifest = json_decode(file_get_contents($manifestPath), true);
        $entries  = $manifest['entries'] ?? [];

        CLI::write('Build complete!', 'green');
        CLI::newLine();

        // Summary table
        CLI::write('Entries:', 'yellow');

        foreach ($entries as $name => $entry) {
            $access = $entry['access'];
            $groups = ! empty($entry['groups']) ? implode(', ', $entry['groups']) : '-';
            $js     = count($entry['files']['js'] ?? []);
            $css    = count($entry['files']['css'] ?? []);
            $chunks = count($entry['chunks'] ?? []);

            $color = $access === 'public' ? 'green' : 'light_red';

            CLI::write("  {$name}", 'white');
            CLI::write("    Access:  {$access}", $color);
            CLI::write("    Groups:  {$groups}", 'light_gray');
            CLI::write("    Files:   {$js} JS, {$css} CSS, {$chunks} chunks", 'light_gray');
        }

        CLI::newLine();
        CLI::write('Asset access rules: ' . count($manifest['fileAccess'] ?? []) . ' files mapped', 'light_gray');
    }

    protected function deleteDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($items as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }

        rmdir($dir);
    }
}
