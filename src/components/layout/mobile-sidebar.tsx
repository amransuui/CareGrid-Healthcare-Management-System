import { Link } from 'react-router-dom'
import { CareGridLogo } from '@/components/brand/caregrid-logo'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { navigationForRole } from '@/config/app-navigation'
import { useAppShellStore } from '@/store/use-app-shell-store'
import { useSession } from '@/hooks/use-auth'

/** Mobile navigation drawer — role-aware navigation from the shared config. */
export function MobileSidebar() {
  const open = useAppShellStore((state) => state.mobileNavOpen)
  const setOpen = useAppShellStore((state) => state.setMobileNavOpen)
  const session = useSession()
  const navigation = navigationForRole(session?.user.role)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle asChild>
            <CareGridLogo />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Application navigation">
          {navigation.map((group) => (
            <div key={group.id} className="mb-5">
              <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t px-4 py-4">
          <p className="text-[11px] leading-snug text-muted-foreground/70">
            Demo frontend · No real backend.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}