import { Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"
import { AppSidebar, type AppSidebarProps } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BreadcrumbEntry {
  label: string
  href?: string
}

export interface SidebarLayoutProps {
  /** Sidebar variant: "default" | "floating" | "inset" */
  sidebarVariant?: "sidebar" | "floating" | "inset"
  /** Sidebar collapsible mode */
  collapsible?: "offcanvas" | "icon" | "none"
  /** Sidebar placement */
  side?: "left" | "right"
  /** Wrap body content in a bordered card-like container */
  carded?: boolean
  /** Breadcrumbs shown in the header */
  breadcrumbs?: BreadcrumbEntry[]
  /** Right-side header content (actions, search, etc.) */
  headerActions?: React.ReactNode
  /** All AppSidebar props — nav items, user, teams, etc. */
  sidebar?: AppSidebarProps
  /** Optional children. If provided, rendered instead of <Outlet />. */
  children?: React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SidebarLayout({
  sidebarVariant = "inset",
  collapsible = "icon",
  side = "left",
  carded = false,
  breadcrumbs = [],
  headerActions,
  sidebar = {},
  children,
}: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        variant={sidebarVariant}
        collapsible={collapsible}
        side={side}
        {...sidebar}
      />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, i) => {
                    const isLast = i === breadcrumbs.length - 1
                    return isLast ? (
                      <BreadcrumbItem key={i}>
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem key={i} className="hidden md:block">
                        <BreadcrumbLink href={crumb.href ?? "#"}>
                          {crumb.label}
                        </BreadcrumbLink>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </BreadcrumbItem>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            {/* Spacer */}
            <div className="flex-1" />
            {/* Right-side actions */}
            {headerActions && (
              <div className="flex items-center gap-2">{headerActions}</div>
            )}
          </div>
        </header>

        {/* Body */}
        {carded ? (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div
              className={cn(
                "flex flex-1 flex-col rounded-xl border bg-card text-card-foreground shadow-sm",
              )}
            >
              {children ?? <Outlet />}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children ?? <Outlet />}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
