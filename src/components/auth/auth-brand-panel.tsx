import { CareGridLogo } from '@/components/brand/caregrid-logo'
import { siteConfig } from '@/config/site'
import { valuePoints } from '@/data/mock/landing-previews'

/**
 * Left-hand brand panel for the auth layouts (hidden below `lg`). Provides
 * subtle healthcare/product context without decoration or claims.
 */
export function AuthBrandPanel() {
  return (
    <aside
      className="hidden flex-col justify-between rounded-2xl border bg-card p-8 shadow-card lg:flex"
      aria-hidden="true"
    >
      <div>
        <CareGridLogo />
        <p className="mt-6 text-2xl font-semibold tracking-tight text-balance">
          {siteConfig.tagline}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {siteConfig.description}
        </p>
      </div>

      <ul className="mt-10 grid gap-3">
        {valuePoints.slice(0, 3).map((point) => (
          <li key={point.title} className="flex gap-3">
            <span
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              role="presentation"
            >
              <svg
                viewBox="0 0 12 12"
                className="size-3 fill-current"
                aria-hidden="true"
              >
                <path d="M4.5 9.2 1.8 6.5l1-1 1.7 1.7 3.7-3.7 1 1-4.7 4.7Z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {point.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {point.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-muted-foreground">
        Demo environment · Educational preview
      </p>
    </aside>
  )
}