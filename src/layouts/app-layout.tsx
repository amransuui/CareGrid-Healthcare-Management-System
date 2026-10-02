import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppTopbar } from '@/components/layout/app-topbar'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

/**
 * Authenticated application shell: collapsible desktop sidebar, mobile
 * drawer, sticky topbar with breadcrumbs, global search and user controls,
 * and the routed content outlet.
 */
export function AppLayout() {
  return (
    <TooltipProvider>
      <div className="flex min-h-svh bg-muted/30">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-card focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <AppSidebar />
        <MobileSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 outline-none"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}