import { type RouteObject } from "react-router-dom"
import { DashboardLayout } from "@/components/ui/modules/dashboard/dashboard-layout"
import DashboardPage from "./page"

export const dashboardRoutes: RouteObject[] = [
  {
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
    ],
  },
]
