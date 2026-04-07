import { useRoutes, type RouteObject } from "react-router-dom"
import LandingPage from "./landing/page"
import LayoutsDemo from "./demo/layouts/page"

const publicRoutes: RouteObject[] = [
  { index: true, element: <LandingPage /> },
  { path: "demo/layouts", element: <LayoutsDemo /> },
  { path: "demo/layouts/:variant", element: <LayoutsDemo /> },
]

export function PublicApp() {
  return useRoutes(publicRoutes)
}
