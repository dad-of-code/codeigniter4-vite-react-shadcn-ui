<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= esc($title ?? 'App') ?></title>
    <?php if (! empty($meta ?? [])): ?>
        <?php foreach ($meta as $key => $value): ?>
            <meta name="<?= esc($key, 'attr') ?>" content="<?= esc($value, 'attr') ?>">
        <?php endforeach; ?>
    <?php endif; ?>
    <?= $this->renderSection('head') ?>
<?php if (ci_vite_is_dev() || ci_vite_css($entry ?? 'index') !== ''): ?>
    <?= ci_vite_css($entry ?? 'index') ?>
<?php else: ?>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:system-ui,-apple-system,sans-serif;background:#0c0a09;color:#e7e5e4;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
        .warning-box{max-width:36rem;text-align:center}
        .warning-box h1{font-size:1.25rem;font-weight:700;color:#fbbf24;margin-bottom:.75rem}
        .warning-box p{font-size:.8125rem;line-height:1.6;color:#a8a29e;margin-bottom:1rem}
        .warning-box code{display:block;background:#1c1917;border:1px solid #292524;border-radius:.375rem;padding:.75rem 1rem;font-family:ui-monospace,monospace;font-size:.75rem;color:#e7e5e4;text-align:left;margin:.5rem 0;white-space:pre;overflow-x:auto}
        .warning-box .hint{font-size:.6875rem;color:#78716c}
    </style>
<?php endif; ?>
</head>
<body<?= isset($bodyClass) ? ' class="' . esc($bodyClass, 'attr') . '"' : '' ?>>
<?php
    $viteReady = ci_vite_is_dev()
        || str_contains(ci_vite_js($entry ?? 'index'), '<script');
?>
<?php if ($viteReady): ?>
    <script>window.__CI4__={shieldEnabled:<?= config('App')->shieldEnabled ? 'true' : 'false' ?>};</script>
    <div id="root"></div>
    <?= $this->renderSection('beforeScripts') ?>
    <?= ci_vite_js($entry ?? 'index') ?>
    <?= $this->renderSection('afterScripts') ?>
<?php else: ?>
    <div class="warning-box">
        <h1>&#9888; React assets not found</h1>
        <p>
            The Vite build has not been compiled yet, or the output is missing.
            CodeIgniter is running, but the React frontend can&rsquo;t load.
        </p>
        <p>Run one of the following to get started:</p>
        <code>pnpm install
pnpm run build</code>
        <p>Or start the dev servers for hot-reload:</p>
        <code>pnpm install
php spark vite:dev</code>
        <p class="hint">
            Assets are expected in <strong>writable/app/</strong>.
            Make sure <strong>ci-manifest.json</strong> exists after building.
            <br>
            Entry: <strong><?= esc($entry ?? 'index') ?></strong>
            &middot; Environment: <strong><?= ENVIRONMENT ?></strong>
        </p>
    </div>
<?php endif; ?>
</body>
</html>
