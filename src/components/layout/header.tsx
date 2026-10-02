import { ChevronDown, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CareGridLogo } from '@/components/brand/caregrid-logo'
import { Container } from '@/components/common/container'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { headerNav } from '@/config/navigation'

function DesktopNav() {
  return (
    <nav
      className="hidden items-center gap-1 md:flex"
      aria-label="Primary"
    >
      {headerNav.map((item) =>
        item.type === 'group' ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {item.label}
                <ChevronDown
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-1.5">
              {item.items.map((link) => (
                <DropdownMenuItem key={link.label} asChild>
                  <Link
                    to={link.href}
                    className="flex flex-col items-start gap-0.5 px-2 py-1.5"
                  >
                    <span className="text-sm font-medium">{link.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {link.description}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button key={item.label} variant="ghost" size="sm" asChild>
            <Link to={item.href}>{item.label}</Link>
          </Button>
        ),
      )}
    </nav>
  )
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-sm gap-0 p-0"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center">
            <CareGridLogo />
            <span className="sr-only">Navigation</span>
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex-1 overflow-y-auto p-3"
          aria-label="Mobile"
        >
          {headerNav.map((item) =>
            item.type === 'group' ? (
              <div key={item.label} className="px-1 py-3">
                <p className="px-2 pb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  {item.label}
                </p>
                <div className="flex flex-col">
                  {item.items.map((link) => (
                    <SheetClose key={link.label} asChild>
                      <Link
                        to={link.href}
                        className="rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            ) : (
              <SheetClose key={item.label} asChild>
                <Link
                  to={item.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              </SheetClose>
            ),
          )}
        </nav>

        <div className="mt-auto grid gap-2 border-t p-4">
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <Container size="wide" as="div">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CareGridLogo />
          </Link>

          <DesktopNav />

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  )
}