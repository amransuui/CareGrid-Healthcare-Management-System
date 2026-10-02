import { ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CareGridLogo } from '@/components/brand/caregrid-logo'
import { Container } from '@/components/common/container'
import { footerColumns } from '@/config/navigation'
import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <Container size="wide" as="div">
        <div className="grid gap-10 py-12 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-8">
          <div className="max-w-sm space-y-3">
            <CareGridLogo />
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-semibold tracking-widest text-foreground uppercase">
                {column.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-3 border-t py-5 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to top
            <ArrowUp className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </Container>
    </footer>
  )
}