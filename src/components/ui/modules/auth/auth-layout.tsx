import { cn } from "@/lib/utils"
import { GalleryVerticalEnd } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"

type AuthLayoutVariant = "center" | "simple" | "combo" | "split"

interface AuthLayoutProps extends React.ComponentProps<"div"> {
  /** Layout variant: "center" | "simple" | "combo" | "split" */
  layout?: AuthLayoutVariant
  /** Form content rendered inside the layout */
  children: React.ReactNode
  /** Custom logo element. Defaults to a placeholder icon. Pass `null` to hide. */
  logo?: React.ReactNode | null
  /** Footer content (e.g. terms/privacy). Pass `null` to hide. */
  footer?: React.ReactNode | null
  /** Image element for layouts with an image panel (combo/split). Pass `null` to hide. */
  image?: React.ReactNode | null
  /** Heading text shown above the form */
  title?: string
  /** Description text shown below the title */
  description?: string
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

function DefaultLogo() {
  return (
    <a href="#" className="flex items-center gap-2 self-center font-medium">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GalleryVerticalEnd className="size-4" />
      </div>
      Acme Inc.
    </a>
  )
}

function DefaultFooter() {
  return (
    <FieldDescription className="px-6 text-center">
      By clicking continue, you agree to our{" "}
      <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
    </FieldDescription>
  )
}

function DefaultImage() {
  return (
    <img
      src="/placeholder.svg"
      alt="Image"
      className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
    />
  )
}

// ---------------------------------------------------------------------------
// Layout variants
// ---------------------------------------------------------------------------

function CenterLayout({
  children,
  logo,
  footer,
  title,
  description,
  className,
  ...props
}: Omit<AuthLayoutProps, "layout" | "image">) {
  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        {logo}
        <div className="flex flex-col gap-6">
          <Card>
            {(title || description) && (
              <CardHeader className="text-center">
                {title && <CardTitle className="text-xl">{title}</CardTitle>}
                {description && (
                  <CardDescription>{description}</CardDescription>
                )}
              </CardHeader>
            )}
            <CardContent>{children}</CardContent>
          </Card>
          {footer}
        </div>
      </div>
    </div>
  )
}

function SimpleLayout({
  children,
  title,
  description,
  className,
  ...props
}: Omit<AuthLayoutProps, "layout" | "logo" | "image" | "footer">) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            {(title || description) && (
              <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && (
                  <CardDescription>{description}</CardDescription>
                )}
              </CardHeader>
            )}
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ComboLayout({
  children,
  image,
  footer,
  title,
  description,
  className,
  ...props
}: Omit<AuthLayoutProps, "layout" | "logo">) {
  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                {(title || description) && (
                  <div className="mb-6 flex flex-col items-center gap-2 text-center">
                    {title && (
                      <h1 className="text-2xl font-bold">{title}</h1>
                    )}
                    {description && (
                      <p className="text-balance text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {children}
              </div>
              {image !== null && (
                <div className="relative hidden bg-muted md:block">
                  {image}
                </div>
              )}
            </CardContent>
          </Card>
          {footer}
        </div>
      </div>
    </div>
  )
}

function SplitLayout({
  children,
  logo,
  image,
  title,
  description,
  className,
  ...props
}: Omit<AuthLayoutProps, "layout" | "footer">) {
  return (
    <div
      className={cn("grid min-h-svh lg:grid-cols-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {logo && (
          <div className="flex justify-center gap-2 md:justify-start">
            {logo}
          </div>
        )}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {(title || description) && (
              <div className="mb-6 flex flex-col items-center gap-1 text-center">
                {title && (
                  <h1 className="text-2xl font-bold">{title}</h1>
                )}
                {description && (
                  <p className="text-sm text-balance text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
      {image !== null && (
        <div className="relative hidden bg-muted lg:block">{image}</div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AuthLayout({
  layout = "center",
  children,
  logo,
  footer,
  image,
  title = "Welcome back",
  description,
  className,
  ...props
}: AuthLayoutProps) {
  const resolvedLogo = logo === null ? null : (logo ?? <DefaultLogo />)
  const resolvedFooter = footer === null ? null : (footer ?? <DefaultFooter />)
  const resolvedImage = image === null ? null : (image ?? <DefaultImage />)

  switch (layout) {
    case "simple":
      return (
        <SimpleLayout
          title={title}
          description={description}
          className={className}
          {...props}
        >
          {children}
        </SimpleLayout>
      )

    case "combo":
      return (
        <ComboLayout
          image={resolvedImage}
          footer={resolvedFooter}
          title={title}
          description={description}
          className={className}
          {...props}
        >
          {children}
        </ComboLayout>
      )

    case "split":
      return (
        <SplitLayout
          logo={resolvedLogo}
          image={resolvedImage}
          title={title}
          description={description}
          className={className}
          {...props}
        >
          {children}
        </SplitLayout>
      )

    case "center":
    default:
      return (
        <CenterLayout
          logo={resolvedLogo}
          footer={resolvedFooter}
          title={title}
          description={description}
          className={className}
          {...props}
        >
          {children}
        </CenterLayout>
      )
  }
}
