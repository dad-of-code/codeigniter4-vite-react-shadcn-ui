import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    __CI4__?: { shieldEnabled: boolean }
  }
}

function ShieldBanner() {
  const enabled = window.__CI4__?.shieldEnabled ?? false

  return (
    <div
      className={`w-full rounded-lg border px-4 py-3 text-xs ${
        enabled
          ? "border-emerald-800 bg-emerald-950/50 text-emerald-300"
          : "border-amber-800 bg-amber-950/50 text-amber-300"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-block size-2 rounded-full ${
            enabled ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span className="font-semibold">
          Shield Auth: {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
      {!enabled && (
        <div className="mt-2 space-y-1 text-amber-300/80">
          <p>Authentication is not active yet. To enable Shield:</p>
          <ol className="list-inside list-decimal space-y-0.5 pl-1 font-mono text-[11px]">
            <li>Configure your database in <code className="rounded bg-amber-900/40 px-1">.env</code></li>
            <li>
              Run migrations:{" "}
              <code className="rounded bg-amber-900/40 px-1">php spark migrate --all</code>
            </li>
            <li>
              Set{" "}
              <code className="rounded bg-amber-900/40 px-1">app.shieldEnabled = true</code>{" "}
              in <code className="rounded bg-amber-900/40 px-1">.env</code>
            </li>
            <li>Restart the PHP server</li>
          </ol>
        </div>
      )}
    </div>
  )
}

function CodeIgniterLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M78.9 22.6C72.2 13.5 62.6 7.7 52.1 5.6c-2-.4-3.4 1.5-2.5 3.3l1.2 2.4c3.8 7.7 4 16.5.6 24.4-1.9 4.4-4.7 8.5-8.2 11.8-.3.3-.8.3-1.1 0-5.2-5.4-8.2-12.5-8.5-20-.1-1.8-2.4-2.6-3.6-1.2C20.5 37.5 15 52.2 17.5 67.5c2.8 17.2 17 30.4 34.3 32.2 21.3 2.2 39.5-12.5 42.2-32.6 1.6-11.8-2.8-24.3-10.6-34.1-.9-1.1-2.5-1.6-3.8-.9-.4.2-.7.6-.7 1.1v.3c.6 6.6-1.7 13.2-6.3 18.1-.3.3-.8.3-1.1 0-3.8-4-6-9.3-6-14.8 0-5.5 1.5-11 4.4-15.8l9-14.6c.7-1.1.2-2.6-1.1-3.1-.1 0-.2-.1-.3-.1-1.3-.3-2.7.1-3.6 1.1z"
        fill="#DD4814"
      />
    </svg>
  )
}

function ViteLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 410 404"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M399.641 59.525l-183.998 329.02c-3.798 6.793-13.559 6.96-17.575.301L7.18 59.525c-4.402-7.304 2.103-16.066 10.33-13.807l184.714 50.67a10.452 10.452 0 006.572 0l177.515-50.67c8.227-2.259 14.732 6.503 10.33 13.807z"
        fill="url(#vite-grad-1)"
      />
      <path
        d="M292.965 1.474l-127.23 24.96a5.226 5.226 0 00-4.168 4.47l-17.803 121.84c-.46 3.143 2.306 5.829 5.464 5.303l34.848-5.814c3.503-.584 6.509 2.508 5.77 5.936L175.5 210.51c-.796 3.69 2.592 6.907 6.143 5.833l22.16-6.698c3.556-1.075 6.945 2.15 6.142 5.843l-22.192 102.077c-1.152 5.302 5.852 8.174 8.577 3.521l1.82-3.108 100.587-196.147c1.873-3.655-1.254-7.856-5.266-7.073l-36.118 7.043c-3.642.71-6.678-2.738-5.744-6.52l26.987-109.456c.936-3.795-2.122-7.253-5.768-6.52z"
        fill="url(#vite-grad-2)"
      />
      <defs>
        <linearGradient
          id="vite-grad-1"
          x1="6.003"
          y1="32.94"
          x2="235.077"
          y2="344.098"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#41D1FF" />
          <stop offset="1" stopColor="#BD34FE" />
        </linearGradient>
        <linearGradient
          id="vite-grad-2"
          x1="194.651"
          y1="8.818"
          x2="236.076"
          y2="292.989"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFBD4F" />
          <stop offset="1" stopColor="#FF9640" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-xl flex-col items-center gap-8">
        {/* Logos */}
        <div className="flex items-center gap-6">
          <a
            href="https://codeigniter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
            title="CodeIgniter"
          >
            <CodeIgniterLogo className="size-20 drop-shadow-lg" />
          </a>
          <PlusIcon className="size-6 text-muted-foreground" />
          <a
            href="https://vite.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
            title="Vite"
          >
            <ViteLogo className="size-20 drop-shadow-lg" />
          </a>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            CI4 + Vite + React
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A full-stack starter powered by CodeIgniter 4, Vite, React &amp;
            shadcn/ui
          </p>
        </div>

        {/* Shield status */}
        <ShieldBanner />

        {/* Quick-start cards */}
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Card
            title="Frontend"
            description="Edit src/app/App.tsx and save to see HMR in action."
            techs={["React 19", "Tailwind CSS v4", "shadcn/ui"]}
          />
          <Card
            title="Backend"
            description="API routes live under /api. Shield handles auth."
            techs={["CodeIgniter 4", "Shield Auth", "PHP 8.2+"]}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <a
              href="https://codeigniter.com/user_guide/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CI4 Docs
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://vite.dev/guide/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vite Docs
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              shadcn/ui
            </a>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60">
          This project is not affiliated with CodeIgniter, Vite, or shadcn.
          <br />
          Press <kbd className="rounded border px-1 font-mono text-[10px]">
            d
          </kbd>{" "}
          to toggle dark mode.
        </p>
      </div>
    </div>
  )
}

function Card({
  title,
  description,
  techs,
}: {
  title: string
  description: string
  techs: string[]
}) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {techs.map((t) => (
          <span
            key={t}
            className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export default App
