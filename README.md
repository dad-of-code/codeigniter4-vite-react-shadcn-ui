# CodeIgniter 4 + Vite + React + shadcn/ui Starter

A full-stack starter that pairs **CodeIgniter 4** (PHP backend + Shield auth) with a **Vite-powered React** frontend using **shadcn/ui** and **Tailwind CSS v4**. CI4 serves the HTML shells, Vite compiles the React entries, and a custom integration layer connects them with automatic asset access control based on Shield groups and permissions.

## Features

- **Multi-entry React builds** — separate bundles for public and authenticated areas
- **Automatic chunk-level access control** — the Vite plugin generates a `ci-manifest.json` mapping every output file to its access rule; the CI4 `AssetController` enforces it using Shield
- **Dev mode with HMR** — a `hot` file tells CI4 to load scripts from the Vite dev server
- **Spark commands** — `vite:build`, `vite:manifest`, `vite:dev` for build automation
- **Shield-ready but DB-optional** — Shield is disabled by default so the app runs immediately without a database; enable it when you're ready
- **shadcn/ui** components pre-configured (Radix primitives, Tailwind CSS v4, dark mode)

## Requirements

- PHP 8.2+ with [intl](http://php.net/manual/en/intl.requirements.php) and [mbstring](http://php.net/manual/en/mbstring.installation.php)
- [Composer](https://getcomposer.org/)
- Node.js 18+ and a package manager ([pnpm](https://pnpm.io/), npm, or yarn)

## Installation

### Quick Start (clone + setup command)

```bash
git clone https://github.com/dad-of-code/codeigniter4-vite-react-starterapp.git my-app
cd my-app

composer install
php spark app:setup
```

The `app:setup` command handles everything automatically:
- Copies `env` → `.env` and sets `CI_ENVIRONMENT = development`
- Generates an encryption key
- Detects your JS package manager (pnpm/npm/yarn), installs Node dependencies, and runs the production build

After setup, start developing:

```bash
# Terminal 1
php spark serve

# Terminal 2
pnpm run dev
```

Open **http://localhost:8080** — CI4 serves the HTML, Vite provides HMR.

### Manual Step-by-Step

If you prefer to run each step yourself:

```bash
# 1. Clone the repository
git clone https://github.com/dad-of-code/codeigniter4-vite-react-starterapp.git my-app
cd my-app

# 2. Install PHP dependencies
composer install

# 3. Create your environment file
cp env .env

# 4. Set development mode — uncomment and change the value in .env:
#    CI_ENVIRONMENT = development

# 5. Generate an encryption key
php spark key:generate

# 6. Install Node dependencies
pnpm install

# 7. Build the frontend (or skip this and use dev mode)
pnpm run build
```

### Downloading as ZIP (No Git)

1. Download the repository as a ZIP from GitHub and extract it
2. Open a terminal in the extracted folder
3. Run `composer install`
4. Run `php spark app:setup`

## Enabling Shield Authentication

Shield is **disabled by default** so the app works without a database. The landing page shows the current status. When you're ready for authentication:

1. **Configure your database** in `.env`:
   ```ini
   database.default.hostname = localhost
   database.default.database = your_db
   database.default.username = root
   database.default.password = secret
   database.default.DBDriver = MySQLi
   database.default.port = 3306
   ```

2. **Run migrations** to create the auth tables:
   ```bash
   php spark migrate --all
   ```

3. **Enable Shield** — add this line to `.env`:
   ```ini
   app.shieldEnabled = true
   ```

4. **Restart the PHP server** — the landing page will show a green "Shield Auth: Enabled" indicator.

Once enabled, `/app` routes require authentication, the `AssetController` enforces per-chunk access rules, and Shield's login/register routes become active.

## Project Structure

```
src/                          # React source code
├── index.tsx                 # Public entry (login, landing)
├── protected.tsx             # Authenticated entry (dashboard)
├── index.css                 # Tailwind / shadcn theme
├── app/                      # App components
│   ├── App.tsx
│   ├── auth/                 # Auth-related pages
│   └── dashboard/            # Dashboard pages
├── components/               # Shared React components
│   ├── ui/                   # shadcn/ui primitives
│   └── theme-provider.tsx
├── hooks/
└── lib/

app/                          # CodeIgniter 4 application
├── Config/
│   ├── Vite.php              # Vite integration config
│   ├── Routes.php            # Route definitions
│   └── Filters.php           # Auth + asset filters
├── Controllers/
│   ├── Home.php              # Serves React SPA views
│   └── AssetController.php   # Serves built assets with MIME + auth
├── Libraries/
│   └── ViteAssets.php        # Manifest reader, tag generator
├── Helpers/
│   └── vite_helper.php       # ci_vite() helper functions
├── Filters/
│   └── ViteAssetFilter.php   # Per-chunk access enforcement
├── Commands/
│   ├── ViteBuild.php         # php spark vite:build
│   ├── ViteManifest.php      # php spark vite:manifest
│   └── ViteDev.php           # php spark vite:dev
└── Views/
    ├── layouts/
    │   └── react.php         # Base HTML layout with <div id="root">
    └── react/
        ├── index.php         # Public SPA view
        └── protected.php     # Authenticated SPA view

writable/app/                 # Build output (git-ignored)
├── assets/                   # JS, CSS, fonts
├── ci-manifest.json          # Access control manifest
└── hot                       # Dev-server marker (auto-created/deleted)

vite-plugin-codeigniter.ts    # Custom Vite plugin
vite.config.ts                # Vite config with entry definitions
```

## Development

Start both the CI4 server and Vite dev server:

```bash
# Option 1: Spark command
php spark vite:dev

# Option 2: Windows batch file
dev.bat

# Option 3: Run them separately
pnpm run dev          # Vite on :5173
php spark serve       # CI4 on :8080
```

Open **http://localhost:8080** — CI4 serves the PHP views, which load scripts from the Vite dev server (HMR enabled).

## Production Build

```bash
# Option 1: Spark command
php spark vite:build

# Option 2: Standard build
pnpm run build

# Option 3: Windows batch file
build.bat
```

Assets compile into `writable/app/` and CI4 serves them through the `AssetController` at `/build/*`.

Inspect the build output:

```bash
php spark vite:manifest           # Summary of all entries
php spark vite:manifest --files   # Per-file access rules
```

## Defining Entry Points

Entries are configured in `vite.config.ts`:

```ts
codeigniter({
  entries: {
    index: {
      input: "src/index.tsx",       // Public routes
      access: "public",
    },
    protected: {
      input: "src/protected.tsx",   // Requires login
      access: "auth",
    },
    admin: {
      input: "src/admin.tsx",       // Requires admin group
      access: "auth",
      groups: ["admin", "superadmin"],
    },
    beta: {
      input: "src/beta.tsx",        // Requires specific permission
      access: "auth",
      permissions: ["beta.access"],
    },
  },
})
```

Each entry becomes a separate React build. The plugin tracks which chunks belong to which entry and writes access rules into `ci-manifest.json`. Shared chunks (e.g. React runtime) used by both public and auth entries are automatically marked public so they load for everyone.

## Adding a New Entry

1. **Create the React entry** — `src/myentry.tsx`
2. **Add it to `vite.config.ts`** in the `entries` object
3. **Create the CI4 view** — `app/Views/react/myentry.php`:
   ```php
   <?= $this->extend('layouts/react') ?>
   ```
4. **Add the controller method**:
   ```php
   public function myentry(): string
   {
       return view('react/myentry', [
           'entry' => 'myentry',
           'title' => 'My Entry',
       ]);
   }
   ```
5. **Add the route** in `app/Config/Routes.php`:
   ```php
   $routes->get('myentry', 'Home::myentry');
   ```
6. **Build** — `pnpm run build`

## Using Vite Assets in Views

The `ci_vite()` helper is loaded globally via `BaseController`:

```php
<!-- All tags (CSS + preloads + JS) -->
<?= ci_vite('index') ?>

<!-- CSS only -->
<?= ci_vite_css('index') ?>

<!-- JS only (with modulepreload hints) -->
<?= ci_vite_js('index') ?>

<!-- Check if dev server is running -->
<?php if (ci_vite_is_dev()): ?>
    <p>Development mode</p>
<?php endif; ?>
```

## Access Control

The `AssetController` checks every request to `/build/*` against the `ci-manifest.json` file-access map:

| Access Level | Behavior |
|---|---|
| `public` | Served to everyone |
| `auth` | Requires Shield login |
| `auth` + `groups` | User must be in at least one listed group |
| `auth` + `permissions` | User must hold at least one listed permission |

Shared chunks used by both public and protected entries are automatically marked `public`. Entry-exclusive chunks inherit their entry's access rule.

## Routes Overview

| URL | Controller | Auth | Description |
|---|---|---|---|
| `/` | `Home::index` | No | Public React SPA |
| `/app`, `/app/*` | `Home::app` | Session\* | Authenticated React SPA |
| `/build/*` | `AssetController::serve` | Per-file\* | Built assets with MIME + access control |
| `/api/health` | `ApiController::health` | No | Health check endpoint |
| `/api/user` | `ApiController::user` | Session\* | Current user info |
| `/login`, `/register`, etc. | Shield | —\* | Shield auth routes |

\* Auth enforcement is only active when `app.shieldEnabled = true` in `.env`.

## Configuration

### `app/Config/Vite.php`

| Property | Default | Description |
|---|---|---|
| `$buildPath` | `WRITEPATH . 'app'` | Where Vite outputs compiled assets |
| `$manifestFile` | `ci-manifest.json` | CI manifest filename |
| `$hotFile` | `hot` | Dev-server marker filename |
| `$assetUrlPrefix` | `/build` | URL prefix for asset routes |
| `$forceDevMode` | `false` | Force dev mode without hot file |
| `$devServerUrl` | `http://localhost:5173` | Fallback dev server URL |

## Available Scripts

### npm / pnpm

| Script | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | TypeScript check + Vite production build |
| `pnpm ci:dev` | Start CI4 + Vite via Spark |
| `pnpm ci:build` | Production build via Spark |
| `pnpm ci:manifest` | Inspect manifest via Spark |

### Spark Commands

| Command | Description |
|---|---|
| `php spark app:setup` | First-time project setup (env, key, deps, build) |
| `php spark app:setup --no-frontend` | Setup without Node install or build |
| `php spark vite:dev` | Start both dev servers |
| `php spark vite:build` | Build + validate manifest |
| `php spark vite:manifest` | Inspect entries and file rules |

## Server Configuration

Point your web server to the `public/` folder. CI4's `index.php` lives there.

For local development, `php spark serve` handles this automatically.

For production (Apache), ensure `.htaccess` rewrites are active. For Nginx, configure `try_files` to fall back to `index.php`.

## License

This project is licensed under the **MIT License**.

### Included Technologies

| Technology | License | Link |
|---|---|---|
| CodeIgniter 4 | MIT | [codeigniter.com](https://codeigniter.com) |
| CodeIgniter Shield | MIT | [github.com/codeigniter4/shield](https://github.com/codeigniter4/shield) |
| Vite | MIT | [vite.dev](https://vite.dev) |
| React | MIT | [react.dev](https://react.dev) |
| shadcn/ui | MIT | [ui.shadcn.com](https://ui.shadcn.com) |
| Tailwind CSS | MIT | [tailwindcss.com](https://tailwindcss.com) |
| Radix UI | MIT | [radix-ui.com](https://www.radix-ui.com) |

See the [LICENSE](LICENSE) file for full terms.
