import * as React from "react"
import { Command } from "lucide-react"
import { AppLink } from "@/components/app-link"
import { NavMain, type NavMainItem } from "./nav-main"
import { NavProjects, type NavProjectItem } from "./nav-projects"
import { NavSecondary, type NavSecondaryItem } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { TeamSwitcher, type TeamItem } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** Main nav items with optional sub-items */
  navMain?: NavMainItem[]
  /** Project links */
  projects?: NavProjectItem[]
  /** Secondary nav items (pinned to bottom of content area) */
  navSecondary?: NavSecondaryItem[]
  /** User info for footer avatar dropdown */
  user?: { name: string; email: string; avatar: string }
  /** Teams for team switcher in header. If omitted, shows a simple app header. */
  teams?: TeamItem[]
  /** Simple app header (used when `teams` is not provided) */
  appName?: string
  /** App icon for simple header */
  appIcon?: React.ElementType
  /** Show the rail for collapsible mode */
  showRail?: boolean
}

// ---------------------------------------------------------------------------
// Default simple header (no team switcher)
// ---------------------------------------------------------------------------

function SimpleHeader({
  appName = "Acme Inc",
  appIcon: AppIcon = Command,
}: {
  appName?: string
  appIcon?: React.ElementType
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <AppLink href="#">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <AppIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{appName}</span>
              <span className="truncate text-xs">Enterprise</span>
            </div>
          </AppLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppSidebar({
  navMain = [],
  projects = [],
  navSecondary = [],
  user,
  teams,
  appName,
  appIcon,
  showRail = true,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {teams && teams.length > 0 ? (
          <TeamSwitcher teams={teams} />
        ) : (
          <SimpleHeader appName={appName} appIcon={appIcon} />
        )}
      </SidebarHeader>
      <SidebarContent>
        {navMain.length > 0 && <NavMain items={navMain} />}
        {projects.length > 0 && <NavProjects projects={projects} />}
        {navSecondary.length > 0 && (
          <NavSecondary items={navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      )}
      {showRail && <SidebarRail />}
    </Sidebar>
  )
}
