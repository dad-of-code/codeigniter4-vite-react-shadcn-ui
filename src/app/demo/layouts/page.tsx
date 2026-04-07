import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthLayout } from "@/components/ui/modules/auth/auth-layout"
import { DashboardLayout } from "@/components/ui/modules/dashboard/dashboard-layout"
import { SidebarLayout } from "@/components/ui/modules/dashboard/sidebar-layout"
import type { NavMainItem } from "@/components/ui/modules/dashboard/nav-main"
import type { NavProjectItem } from "@/components/ui/modules/dashboard/nav-projects"
import type { NavSecondaryItem } from "@/components/ui/modules/dashboard/nav-secondary"
import type { TeamItem } from "@/components/ui/modules/dashboard/team-switcher"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings,
  Settings2,
  SquareTerminal,
  BarChart3,
  Users,
  type LucideIcon,
  Maximize2,
  Minimize2,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Demo login form (reused inside every auth layout preview)
// ---------------------------------------------------------------------------

function DemoLoginForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="demo-email">Email</FieldLabel>
          <Input
            id="demo-email"
            type="email"
            placeholder="m@example.com"
            defaultValue=""
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="demo-password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Forgot your password?
            </a>
          </div>
          <Input id="demo-password" type="password" defaultValue="" />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="underline underline-offset-4"
            >
              Sign up
            </a>
          </FieldDescription>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            Login with Google
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Demo dashboard content (shown inside dashboard layout preview)
// ---------------------------------------------------------------------------

function DemoDashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your dashboard. This is a preview of the top-nav layout.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$45,231", change: "+20.1%" },
          { label: "Subscriptions", value: "+2,350", change: "+180.1%" },
          { label: "Sales", value: "+12,234", change: "+19%" },
          { label: "Active Now", value: "+573", change: "+201" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg border bg-muted/50 p-6">
        <p className="text-sm text-muted-foreground">
          Chart / content area placeholder
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demo sidebar content (shown inside sidebar layout preview)
// ---------------------------------------------------------------------------

function DemoSidebarContent() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Here&apos;s a preview of the sidebar layout.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$45,231", change: "+20.1%" },
          { label: "Subscriptions", value: "+2,350", change: "+180.1%" },
          { label: "Sales", value: "+12,234", change: "+19%" },
          { label: "Active Now", value: "+573", change: "+201" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg border bg-muted/50 p-6">
        <p className="text-sm text-muted-foreground">
          Chart / content area placeholder
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared sidebar demo data
// ---------------------------------------------------------------------------

const demoSidebarNavMain: NavMainItem[] = [
  {
    title: "Playground",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "History", url: "#" },
      { title: "Starred", url: "#" },
      { title: "Settings", url: "#" },
    ],
  },
  {
    title: "Models",
    url: "#",
    icon: Bot,
    items: [
      { title: "Genesis", url: "#" },
      { title: "Explorer", url: "#" },
      { title: "Quantum", url: "#" },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Introduction", url: "#" },
      { title: "Get Started", url: "#" },
      { title: "Tutorials", url: "#" },
      { title: "Changelog", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "General", url: "#" },
      { title: "Team", url: "#" },
      { title: "Billing", url: "#" },
      { title: "Limits", url: "#" },
    ],
  },
]

const demoSidebarProjects: NavProjectItem[] = [
  { name: "Design Engineering", url: "#", icon: Frame },
  { name: "Sales & Marketing", url: "#", icon: PieChart },
  { name: "Travel", url: "#", icon: Map },
]

const demoSidebarSecondary: NavSecondaryItem[] = [
  { title: "Support", url: "#", icon: LifeBuoy },
  { title: "Feedback", url: "#", icon: Send },
]

const demoSidebarTeams: TeamItem[] = [
  { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
  { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
  { name: "Evil Corp.", logo: Command, plan: "Free" },
]

const demoSidebarUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "",
}

// ---------------------------------------------------------------------------
// Variant definitions
// ---------------------------------------------------------------------------

interface DemoVariant {
  id: string
  label: string
  description: string
  category: "auth" | "dashboard"
}

const variants: DemoVariant[] = [
  {
    id: "auth-center",
    label: "Auth · Center",
    description: "Centered card on muted background with logo",
    category: "auth",
  },
  {
    id: "auth-simple",
    label: "Auth · Simple",
    description: "Minimal card, no social separation",
    category: "auth",
  },
  {
    id: "auth-combo",
    label: "Auth · Combo",
    description: "Card with form + image panel side by side",
    category: "auth",
  },
  {
    id: "auth-split",
    label: "Auth · Split",
    description: "Full-height split with image on right",
    category: "auth",
  },
  {
    id: "dashboard-top",
    label: "Top Nav",
    description: "Top menu with app switcher and tab navigation",
    category: "dashboard",
  },
  {
    id: "dashboard-top-carded",
    label: "Top Nav · Carded",
    description: "Top menu with body content in a card container",
    category: "dashboard",
  },
  {
    id: "sidebar-default",
    label: "Sidebar · Default",
    description: "Standard sidebar with team switcher",
    category: "dashboard",
  },
  {
    id: "sidebar-floating",
    label: "Sidebar · Floating",
    description: "Floating sidebar with rounded edges",
    category: "dashboard",
  },
  {
    id: "sidebar-inset",
    label: "Sidebar · Inset",
    description: "Inset sidebar with inset body content",
    category: "dashboard",
  },
  {
    id: "sidebar-inset-carded",
    label: "Sidebar · Inset Carded",
    description: "Inset sidebar with body wrapped in a card",
    category: "dashboard",
  },
]

// ---------------------------------------------------------------------------
// Render individual previews
// ---------------------------------------------------------------------------

function RenderPreview({ variantId }: { variantId: string }) {
  switch (variantId) {
    case "auth-center":
      return (
        <AuthLayout
          layout="center"
          title="Welcome back"
          description="Login with your Apple or Google account"
        >
          <DemoLoginForm />
        </AuthLayout>
      )
    case "auth-simple":
      return (
        <AuthLayout
          layout="simple"
          title="Login to your account"
          description="Enter your email below to login to your account"
          logo={null}
          footer={null}
        >
          <DemoLoginForm />
        </AuthLayout>
      )
    case "auth-combo":
      return (
        <AuthLayout
          layout="combo"
          title="Welcome back"
          description="Login to your Acme Inc account"
        >
          <DemoLoginForm />
        </AuthLayout>
      )
    case "auth-split":
      return (
        <AuthLayout
          layout="split"
          title="Login to your account"
          description="Enter your email below to login to your account"
        >
          <DemoLoginForm />
        </AuthLayout>
      )
    case "dashboard-top":
      return <DashboardPreview carded={false} />
    case "dashboard-top-carded":
      return <DashboardPreview carded={true} />
    case "sidebar-default":
      return (
        <SidebarPreview sidebarVariant="sidebar" carded={false} />
      )
    case "sidebar-floating":
      return (
        <SidebarPreview sidebarVariant="floating" carded={false} />
      )
    case "sidebar-inset":
      return (
        <SidebarPreview sidebarVariant="inset" carded={false} />
      )
    case "sidebar-inset-carded":
      return (
        <SidebarPreview sidebarVariant="inset" carded={true} />
      )
    default:
      return (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Select a layout from the sidebar
        </div>
      )
  }
}

function DashboardPreview({ carded }: { carded: boolean }) {
  const demoApps = [
    { name: "Dashboard", href: "#", logo: "📊" },
    { name: "Admin", href: "#", logo: "⚙️" },
    { name: "Docs", href: "https://docs.example.com", logo: "📚" },
  ]

  const demoNav: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Overview", href: "#", icon: Home },
    { label: "Analytics", href: "#", icon: BarChart3 },
    { label: "Customers", href: "#", icon: Users },
    { label: "Settings", href: "#", icon: Settings },
  ]

  const demoUser = {
    name: "John Doe",
    email: "john@example.com",
  }

  return (
    <DashboardLayout
      apps={demoApps}
      navItems={demoNav}
      user={demoUser}
      carded={carded}
    >
      <DemoDashboardContent />
    </DashboardLayout>
  )
}

function SidebarPreview({
  sidebarVariant,
  carded,
}: {
  sidebarVariant: "sidebar" | "floating" | "inset"
  carded: boolean
}) {
  return (
    <SidebarLayout
      sidebarVariant={sidebarVariant}
      carded={carded}
      breadcrumbs={[
        { label: "Building Your Application", href: "#" },
        { label: "Data Fetching" },
      ]}
      sidebar={{
        navMain: demoSidebarNavMain,
        projects: demoSidebarProjects,
        navSecondary: demoSidebarSecondary,
        teams: demoSidebarTeams,
        user: demoSidebarUser,
      }}
    >
      <DemoSidebarContent />
    </SidebarLayout>
  )
}

// ---------------------------------------------------------------------------
// Main demo page
// ---------------------------------------------------------------------------

export default function LayoutsDemo() {
  const { variant: urlVariant } = useParams()
  const navigate = useNavigate()
  const [fullscreen, setFullscreen] = useState(false)

  const activeId = urlVariant ?? "auth-center"
  const activeVariant = variants.find((v) => v.id === activeId) ?? variants[0]

  const authVariants = variants.filter((v) => v.category === "auth")
  const dashboardVariants = variants.filter((v) => v.category === "dashboard")

  if (fullscreen) {
    return (
      <div className="relative min-h-svh">
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-4 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        >
          <Minimize2 className="size-4" />
        </Button>
        <RenderPreview variantId={activeId} />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-svh w-72 shrink-0 flex-col border-r bg-background">
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <span className="text-sm font-medium">Layouts Demo</span>
        </div>

        {/* Variant list */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auth Layouts
          </p>
          <div className="flex flex-col gap-0.5">
            {authVariants.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate(`/demo/layouts/${v.id}`)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeId === v.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                )}
              >
                <span className="font-medium">{v.label}</span>
                <span className="text-[11px] leading-tight opacity-70">
                  {v.description}
                </span>
              </button>
            ))}
          </div>

          <Separator className="my-3" />

          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dashboard Layouts
          </p>
          <div className="flex flex-col gap-0.5">
            {dashboardVariants.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate(`/demo/layouts/${v.id}`)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeId === v.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                )}
              >
                <span className="font-medium">{v.label}</span>
                <span className="text-[11px] leading-tight opacity-70">
                  {v.description}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t px-4 py-3 text-[11px] text-muted-foreground">
          <code>AuthLayout</code> · <code>DashboardLayout</code> · <code>SidebarLayout</code>
        </div>
      </aside>

      {/* Preview area */}
      <div className="flex flex-1 flex-col">
        {/* Preview toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div>
            <h2 className="text-sm font-medium">{activeVariant.label}</h2>
            <p className="text-xs text-muted-foreground">
              {activeVariant.description}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setFullscreen(true)}
          >
            <Maximize2 className="size-3.5" />
            Fullscreen
          </Button>
        </div>

        {/* Preview content — rendered in an iframe-like container */}
        <div className="relative flex-1 overflow-auto bg-muted/30">
          <div className="min-h-full">
            <RenderPreview variantId={activeId} />
          </div>
        </div>
      </div>
    </div>
  )
}
