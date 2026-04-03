<?php

namespace App\Filters;

use App\Libraries\ViteAssets;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ViteAssetFilter — optional before-filter that can be applied to the
 * /build/* route group as an alternative to inline checks in AssetController.
 *
 * When attached, it reads the ci-manifest.json file-access map and rejects
 * unauthenticated / unauthorized requests before the controller runs.
 *
 * Register in Config\Filters:
 *   'viteAsset' => ViteAssetFilter::class
 *
 * Apply to routes:
 *   $routes->group('build', ['filter' => 'viteAsset'], function($routes) { ... });
 */
class ViteAssetFilter implements FilterInterface
{
    /**
     * @param array|null $arguments
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // Extract the asset path from the URI (strip the /build/ prefix)
        $uri  = $request->getUri()->getPath();
        $path = preg_replace('#^/build/#', '', $uri);

        if (empty($path)) {
            return;
        }

        $vite   = new ViteAssets();
        $access = $vite->fileAccess($path);

        // No access rule or public → allow
        if ($access === null || $access['access'] === 'public') {
            return;
        }

        // Shield not enabled yet — skip auth checks
        if (! config('App')->shieldEnabled) {
            return;
        }

        $auth = service('auth');
        if (! $auth->loggedIn()) {
            return service('response')->setStatusCode(403);
        }

        $user = $auth->user();

        if (! empty($access['groups'])) {
            $inGroup = false;
            foreach ($access['groups'] as $group) {
                if ($user->inGroup($group)) {
                    $inGroup = true;
                    break;
                }
            }
            if (! $inGroup) {
                return service('response')->setStatusCode(403);
            }
        }

        if (! empty($access['permissions'])) {
            $hasPermission = false;
            foreach ($access['permissions'] as $perm) {
                if ($user->can($perm)) {
                    $hasPermission = true;
                    break;
                }
            }
            if (! $hasPermission) {
                return service('response')->setStatusCode(403);
            }
        }
    }

    /**
     * @param array|null $arguments
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No post-processing needed
    }
}
