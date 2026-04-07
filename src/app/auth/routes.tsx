import { type RouteObject } from "react-router-dom"
import AuthPage from "./page"

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <AuthPage />,
  },
]
