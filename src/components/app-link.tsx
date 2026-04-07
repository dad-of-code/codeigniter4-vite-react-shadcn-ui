import { forwardRef } from "react"
import { Link, type LinkProps } from "react-router-dom"
import { cn } from "@/lib/utils"

/**
 * Determines whether a URL is external (absolute http/https or protocol-relative).
 */
function isExternalUrl(href: string): boolean {
  return /^https?:\/\/|^\/\//.test(href)
}

type AppLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Partial<Pick<LinkProps, "to" | "replace" | "state">> & {
    /** The URL. External links render <a>, internal render React Router <Link>. */
    href?: string
  }

/**
 * A universal link component that automatically chooses between React Router's
 * `<Link>` for internal navigation and a plain `<a>` for external URLs.
 *
 * Usage:
 *   <AppLink href="/dashboard">Dashboard</AppLink>       → React Router
 *   <AppLink href="https://example.com">Ext</AppLink>    → <a target="_blank">
 *   <AppLink to="/settings">Settings</AppLink>           → React Router (explicit)
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ href, to, className, children, replace, state, ...props }, ref) => {
    const destination = to ?? href ?? "#"

    // External links
    if (typeof destination === "string" && isExternalUrl(destination)) {
      return (
        <a
          ref={ref}
          href={destination}
          className={cn(className)}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    }

    // Internal — use React Router
    return (
      <Link
        ref={ref}
        to={destination}
        replace={replace}
        state={state}
        className={cn(className)}
        {...(props as Omit<typeof props, "href">)}
      >
        {children}
      </Link>
    )
  },
)

AppLink.displayName = "AppLink"
