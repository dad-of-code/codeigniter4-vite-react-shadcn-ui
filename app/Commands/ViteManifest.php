<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * Inspect the current ci-manifest.json and show entry/chunk details.
 *
 * Usage:
 *   php spark vite:manifest             — show all entries
 *   php spark vite:manifest --entry=protected  — show a single entry
 *   php spark vite:manifest --files     — list every file with its access rule
 */
class ViteManifest extends BaseCommand
{
    protected $group       = 'Vite';
    protected $name        = 'vite:manifest';
    protected $description = 'Inspect the Vite CI manifest (entries, chunks, access rules)';
    protected $usage       = 'vite:manifest [--entry=name] [--files]';

    protected $options = [
        '--entry' => 'Show details for a specific entry',
        '--files' => 'List every output file with its access rule',
    ];

    public function run(array $params)
    {
        $config       = config('Vite');
        $manifestPath = rtrim($config->buildPath, '/\\') . DIRECTORY_SEPARATOR . $config->manifestFile;

        if (! is_file($manifestPath)) {
            CLI::error('ci-manifest.json not found at: ' . $manifestPath);
            CLI::write('Run "php spark vite:build" first.', 'light_gray');
            return;
        }

        $manifest = json_decode(file_get_contents($manifestPath), true);
        $entries  = $manifest['entries'] ?? [];
        $files    = $manifest['fileAccess'] ?? [];

        $entryFilter = $params['entry'] ?? CLI::getOption('entry');
        $showFiles   = array_key_exists('files', $params) || CLI::getOption('files');

        // ---- Display entries ---- //
        if ($entryFilter) {
            if (! isset($entries[$entryFilter])) {
                CLI::error("Entry \"{$entryFilter}\" not found.");
                CLI::write('Available: ' . implode(', ', array_keys($entries)), 'light_gray');
                return;
            }
            $this->printEntry($entryFilter, $entries[$entryFilter]);
        } else {
            CLI::write('Entries in ci-manifest.json:', 'yellow');
            CLI::newLine();

            foreach ($entries as $name => $entry) {
                $this->printEntry($name, $entry);
            }
        }

        // ---- Display file access map ---- //
        if ($showFiles) {
            CLI::newLine();
            CLI::write('File access map:', 'yellow');
            CLI::newLine();

            foreach ($files as $file => $rule) {
                $access = $rule['access'];
                $extra  = '';

                if (! empty($rule['groups'])) {
                    $extra .= ' groups=[' . implode(',', $rule['groups']) . ']';
                }
                if (! empty($rule['permissions'])) {
                    $extra .= ' permissions=[' . implode(',', $rule['permissions']) . ']';
                }

                $color = $access === 'public' ? 'green' : 'light_red';
                CLI::write("  [{$access}]{$extra}", $color);
                CLI::write("    {$file}", 'light_gray');
            }
        }
    }

    protected function printEntry(string $name, array $entry): void
    {
        $access = $entry['access'];
        $color  = $access === 'public' ? 'green' : 'light_red';

        CLI::write("  {$name} ({$entry['input']})", 'white');
        CLI::write("    Access:      {$access}", $color);

        if (! empty($entry['groups'])) {
            CLI::write('    Groups:      ' . implode(', ', $entry['groups']), 'light_gray');
        }
        if (! empty($entry['permissions'])) {
            CLI::write('    Permissions: ' . implode(', ', $entry['permissions']), 'light_gray');
        }

        CLI::write('    JS:          ' . implode(', ', $entry['files']['js'] ?? []), 'light_gray');
        CLI::write('    CSS:         ' . implode(', ', $entry['files']['css'] ?? []), 'light_gray');

        if (! empty($entry['chunks'])) {
            CLI::write('    Chunks:      ' . implode(', ', $entry['chunks']), 'light_gray');
        }
        if (! empty($entry['preloads'])) {
            CLI::write('    Preloads:    ' . implode(', ', $entry['preloads']), 'light_gray');
        }

        CLI::newLine();
    }
}
