<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * Scaffold a new React module with backend routes and frontend pages.
 *
 * Creates:
 *   1. app/Controllers/Api/{Module}Controller.php   — API controller
 *   2. app/Routes/{Module}/{Module}Routes.php       — CI4 route file
 *   3. src/app/{module}/routes.tsx                   — React route file
 *   4. src/app/{module}/page.tsx                     — Default page component
 *
 * Then prints instructions for wiring the new module into
 * Config/Routes.php and src/app/routes.tsx.
 *
 * Usage:
 *   php spark make:react settings
 *   php spark make:react admin --filter=session
 *   php spark make:react reports --api-prefix=api/v1/reports
 */
class MakeReact extends BaseCommand
{
    protected $group       = 'App';
    protected $name        = 'make:react';
    protected $description = 'Scaffold a new React module (controller, routes, page)';
    protected $usage       = 'make:react <module> [--filter=<filter>] [--api-prefix=<prefix>]';

    protected $arguments = [
        'module' => 'The module name (e.g. "settings", "admin", "reports")',
    ];

    protected $options = [
        '--filter'     => 'CI4 route filter to apply (default: session)',
        '--api-prefix' => 'Custom API prefix (default: api/{module})',
    ];

    public function run(array $params)
    {
        $module = array_shift($params);

        if (empty($module)) {
            $module = CLI::prompt('Module name (lowercase, e.g. "settings")');
        }

        if (empty($module)) {
            CLI::error('Module name is required.');
            return;
        }

        // Normalize
        $moduleLower  = strtolower(trim($module));
        $modulePascal = str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $moduleLower)));
        $moduleKebab  = str_replace('_', '-', $moduleLower);

        $filter    = CLI::getOption('filter') ?? 'session';
        $apiPrefix = CLI::getOption('api-prefix') ?? "api/{$moduleLower}";

        CLI::newLine();
        CLI::write("╔══════════════════════════════════════════════════╗", 'green');
        CLI::write("║   Scaffolding React Module: {$modulePascal}",       'green');
        CLI::write("╚══════════════════════════════════════════════════╝", 'green');
        CLI::newLine();

        // ── 1. API Controller ──────────────────────────────────
        $this->createController($modulePascal);

        // ── 2. CI4 Route File ──────────────────────────────────
        $this->createRouteFile($modulePascal, $moduleLower, $apiPrefix, $filter);

        // ── 3. React Route File ────────────────────────────────
        $this->createReactRoutes($moduleLower, $modulePascal, $moduleKebab);

        // ── 4. React Page ──────────────────────────────────────
        $this->createReactPage($moduleLower, $modulePascal);

        // ── 5. Summary & wiring instructions ───────────────────
        CLI::newLine();
        CLI::write('══════════════════════════════════════════════════', 'yellow');
        CLI::write('  Wiring Instructions', 'yellow');
        CLI::write('══════════════════════════════════════════════════', 'yellow');
        CLI::newLine();

        CLI::write('1. Add to app/Config/Routes.php (before the if-shield block):', 'white');
        CLI::write("   \\App\\Routes\\{$modulePascal}\\{$modulePascal}Routes::registerRoutes(\$routes);", 'green');
        CLI::newLine();

        CLI::write('2. Add to src/app/routes.tsx:', 'white');
        CLI::write("   import { {$moduleLower}Routes } from \"./{$moduleLower}/routes\"", 'green');
        CLI::write("   // Then add ...{$moduleLower}Routes to the routes array", 'green');
        CLI::newLine();

        CLI::write('Done! Your new module is ready.', 'green');
        CLI::newLine();
    }

    /**
     * Create the API controller.
     */
    private function createController(string $modulePascal): void
    {
        $dir  = APPPATH . "Controllers/Api/";
        $file = $dir . "{$modulePascal}Controller.php";

        if (is_file($file)) {
            CLI::write("  ✓ Controller already exists: {$file}", 'yellow');
            return;
        }

        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $content = <<<PHP
<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

class {$modulePascal}Controller extends BaseController
{
    /**
     * GET {api_prefix}/
     */
    public function index(): ResponseInterface
    {
        return \$this->response->setJSON([
            'status'  => 'ok',
            'module'  => '{$modulePascal}',
            'message' => '{$modulePascal} module is active.',
        ]);
    }
}
PHP;

        file_put_contents($file, $content);
        CLI::write("  ✓ Created controller: {$file}", 'green');
    }

    /**
     * Create the CI4 route file.
     */
    private function createRouteFile(string $modulePascal, string $moduleLower, string $apiPrefix, string $filter): void
    {
        $dir  = APPPATH . "Routes/{$modulePascal}/";
        $file = $dir . "{$modulePascal}Routes.php";

        if (is_file($file)) {
            CLI::write("  ✓ Route file already exists: {$file}", 'yellow');
            return;
        }

        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filterLine = $filter ? "'filter' => '{$filter}'" : '';

        $content = <<<PHP
<?php

namespace App\Routes\\{$modulePascal};

use CodeIgniter\Router\RouteCollection;

/**
 * {$modulePascal} Routes
 *
 * @package App\Routes\\{$modulePascal}
 */
class {$modulePascal}Routes
{
    /**
     * Register {$modulePascal} routes for the application
     *
     * @param RouteCollection \$routes
     * @param string \$base_uri
     * @return void
     */
    public static function registerRoutes(RouteCollection \$routes, string \$base_uri = '{$apiPrefix}'): void
    {
        \$routes->group(\$base_uri, ['namespace' => 'App\Controllers\Api'{$filterLine}], static function (\$routes) {
            \$routes->get('/', '{$modulePascal}Controller::index');
        });
    }
}
PHP;

        file_put_contents($file, $content);
        CLI::write("  ✓ Created route file: {$file}", 'green');
    }

    /**
     * Create the React route file.
     */
    private function createReactRoutes(string $moduleLower, string $modulePascal, string $moduleKebab): void
    {
        $root = ROOTPATH;
        $dir  = "{$root}src/app/{$moduleLower}/";
        $file = $dir . 'routes.tsx';

        if (is_file($file)) {
            CLI::write("  ✓ React routes already exist: {$file}", 'yellow');
            return;
        }

        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $content = <<<TSX
import { type RouteObject } from "react-router-dom"
import {$modulePascal}Page from "./page"

export const {$moduleLower}Routes: RouteObject[] = [
  {
    path: "{$moduleKebab}",
    element: <{$modulePascal}Page />,
  },
]
TSX;

        file_put_contents($file, $content);
        CLI::write("  ✓ Created React routes: {$file}", 'green');
    }

    /**
     * Create the default React page component.
     */
    private function createReactPage(string $moduleLower, string $modulePascal): void
    {
        $root = ROOTPATH;
        $dir  = "{$root}src/app/{$moduleLower}/";
        $file = $dir . 'page.tsx';

        if (is_file($file)) {
            CLI::write("  ✓ React page already exists: {$file}", 'yellow');
            return;
        }

        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $content = <<<TSX
export default function {$modulePascal}Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight">{$modulePascal}</h1>
      <p className="text-sm text-muted-foreground">
        This is the {$modulePascal} module. Start building here.
      </p>
    </div>
  )
}
TSX;

        file_put_contents($file, $content);
        CLI::write("  ✓ Created React page: {$file}", 'green');
    }
}
