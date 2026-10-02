import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { AppBreadcrumb } from '@/components/layout/app-breadcrumb'
import { GlobalSearch } from '@/components/layout/global-search'
import { NotificationCenter } from '@/components/layout/notification-center'
import { UserMenu } from '@/components/layout/user-menu'
import { Button } from '@/components/ui/button'
import { useAppShellStore } from '@/store/use-app-shell-store'

/** Sticky application topbar: controls, breadcrumb, search, notifications, user. */
export function AppTopbar() {
  const collapsed = useAppShellStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAppShellStore((state) => state.toggleSidebar)
  const setMobileNavOpen = useAppShellStore((state) => state.setMobileNavOpen)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-1 border-b bg-background/85 px-3 backdrop-blur sm:gap-2 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={toggleSidebar}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="size-5" aria-hidden="true" />
        )}
      </Button>

      <div className="hidden min-w-0 md:block">
        <AppBreadcrumb />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <GlobalSearch />
        <NotificationCenter />
        <span
          className="mx-1 hidden h-5 w-px bg-border sm:block"
          aria-hidden="true"
        />
        <UserMenu />
      </div>
    </header>
  )
}