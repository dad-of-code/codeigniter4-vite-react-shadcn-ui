import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { AppLink } from "@/components/app-link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ChevronsUpDown,
  Menu,
  Search,
  Home,
  Settings,
  LogOut,
  BadgeCheck,
  Bell,
  CreditCard,
  type LucideIcon,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppItem {
  /** Display name shown in the app switcher */
  name: string
  /** URL or route path. External URLs open in a new tab. */
  href: string
  /** Optional icon (React component or URL) */
  icon?: React.ReactNode
  /** Optional emoji/image shown beside name */
  logo?: string
}

export interface NavItem {
  /** Display label */
  label: string
  /** URL or route path */
  href: string
  /** Lucide icon component */
  icon?: LucideIcon
  /** If true, this link opens externally */
  external?: boolean
}

export interface UserInfo {
  name: string
  email: string
  avatar?: string
}

export interface DashboardLayoutProps {
  /** App switcher items (the "Frontier" style breadcrumb dropdown) */
  apps?: AppItem[]
  /** Currently selected app (defaults to first in `apps`) */
  currentApp?: AppItem
  /** Top-bar navigation tabs */
  navItems?: NavItem[]
  /** User info for the avatar dropdown */
  user?: UserInfo
  /** Custom logo element in the top-left */
  logo?: React.ReactNode
  /** Right-side header actions (before user avatar) */
  headerActions?: React.ReactNode
  /** Footer content override for mobile */
  mobileFooterItems?: NavItem[]
  /** Optional children. If provided, rendered instead of <Outlet />. */
  children?: React.ReactNode
  /** Wrap body content in a bordered card-like container */
  carded?: boolean
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultApps: AppItem[] = [
  { name: "Dashboard", href: "/dashboard", logo: "📊" },
]

const defaultNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Settings", href: "/settings", icon: Settings },
]

const defaultUser: UserInfo = {
  name: "User",
  email: "user@example.com",
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AppSwitcher({
  apps,
  currentApp,
  className,
}: {
  apps: AppItem[]
  currentApp: AppItem
  className?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-2 text-sm font-medium",
            className,
          )}
        >
          {currentApp.logo && (
            <span className="text-base">{currentApp.logo}</span>
          )}
          {currentApp.icon}
          <span>{currentApp.name}</span>
          <ChevronsUpDown className="ml-1 size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch app</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {apps.map((app) => (
          <DropdownMenuItem key={app.href} asChild>
            <AppLink href={app.href} className="flex items-center gap-2">
              {app.logo && <span className="text-base">{app.logo}</span>}
              {app.icon}
              <span>{app.name}</span>
            </AppLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavTabs({
  items,
  className,
}: {
  items: NavItem[]
  className?: string
}) {
  const location = useLocation()

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {items.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href !== "/" && location.pathname.startsWith(item.href))

        return (
          <AppLink
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            {item.icon && <item.icon className="size-4" />}
            {item.label}
          </AppLink>
        )
      })}
    </nav>
  )
}

function UserMenu({ user }: { user: UserInfo }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <Avatar className="size-8">
            {user.avatar && (
              <AvatarImage src={user.avatar} alt={user.name} />
            )}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <BadgeCheck className="mr-2 size-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="mr-2 size-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="mr-2 size-4" />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileNav({
  apps,
  currentApp,
  navItems,
  user,
  logo,
}: {
  apps: AppItem[]
  currentApp: AppItem
  navItems: NavItem[]
  user: UserInfo
  logo?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-80 p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            {logo}
            <span>{currentApp.name}</span>
          </SheetTitle>
        </SheetHeader>
        <Separator />

        {/* App switcher */}
        <div className="px-4 py-3">
          <p className="mb-2 px-2 text-xs font-medium uppercase text-muted-foreground">
            Apps
          </p>
          <div className="flex flex-col gap-1">
            {apps.map((app) => (
              <AppLink
                key={app.href}
                href={app.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                  app.href === currentApp.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                )}
              >
                {app.logo && <span className="text-lg">{app.logo}</span>}
                {app.icon}
                <span>{app.name}</span>
              </AppLink>
            ))}
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <div className="px-4 py-3">
          <p className="mb-2 px-2 text-xs font-medium uppercase text-muted-foreground">
            Navigation
          </p>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href))

              return (
                <AppLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  )}
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.label}</span>
                </AppLink>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* User section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="size-8">
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={user.name} />
              )}
              <AvatarFallback className="text-xs">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileFooterNav({ items }: { items: NavItem[] }) {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-background px-2 py-1 md:hidden">
      {items.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href !== "/" && location.pathname.startsWith(item.href))

        return (
          <AppLink
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[10px] font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {item.icon && (
              <item.icon
                className={cn("size-5", isActive && "text-primary")}
              />
            )}
            <span>{item.label}</span>
          </AppLink>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------

export function DashboardLayout({
  apps = defaultApps,
  currentApp,
  navItems = defaultNav,
  user = defaultUser,
  logo,
  headerActions,
  mobileFooterItems,
  children,
  carded = false,
}: DashboardLayoutProps = {}) {
  const activeApp = currentApp ?? apps[0] ?? defaultApps[0]
  const footerItems = mobileFooterItems ?? navItems.slice(0, 5)

  return (
    <div className="flex min-h-svh flex-col">
      {/* ── Desktop / Tablet Header ── */}
      <header className="sticky top-0 z-40 border-b bg-background">
        {/* Top row: logo + app switcher + actions + user */}
        <div className="flex h-14 items-center gap-4 px-4 md:px-6">
          {/* Mobile hamburger */}
          <MobileNav
            apps={apps}
            currentApp={activeApp}
            navItems={navItems}
            user={user}
            logo={logo}
          />

          {/* Logo */}
          {logo && (
            <div className="hidden shrink-0 md:flex">{logo}</div>
          )}

          {/* App switcher (Frontier-style breadcrumb) */}
          <div className="hidden md:flex">
            {logo && (
              <Separator orientation="vertical" className="mx-2 h-6" />
            )}
            <AppSwitcher apps={apps} currentApp={activeApp} />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {headerActions}
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Search className="size-4" />
              <span className="sr-only">Search</span>
            </Button>
            <div className="hidden md:flex">
              <UserMenu user={user} />
            </div>
          </div>
        </div>

        {/* Sub-nav tab row (desktop only) */}
        <div className="hidden border-t md:block">
          <div className="px-4 md:px-6">
            <NavTabs items={navItems} className="-mb-px py-1" />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex flex-1 flex-col pb-16 md:pb-0">
        {carded ? (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex flex-1 flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
              {children ?? <Outlet />}
            </div>
          </div>
        ) : (
          children ?? <Outlet />
        )}
      </main>

      {/* ── Mobile footer nav ── */}
      <MobileFooterNav items={footerItems} />
    </div>
  )
}
