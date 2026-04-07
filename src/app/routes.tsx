import { type RouteObject } from "react-router-dom"

// ── Route modules ──────────────────────────────────────────────
// Each app section exports its own route tree.
// Add new route files here after scaffolding with `php spark make:react`.
import { dashboardRoutes } from "./dashboard/routes"
import { authRoutes } from "./auth/routes"

/**
 * Master route table for the authenticated SPA.
 *
 * The CI4 backend serves `/app` and `/app/*` to the same React entry point.
 * React Router takes over from there.
 */
export const routes: RouteObject[] = [
  ...authRoutes,
  ...dashboardRoutes,
]
