import { Link, useLocation } from 'react-router-dom'
import { cn } from 'cn'
import { CareGridLogo } from '@/components/brand/caregrid-logo'
import { StatusBadge } from '@/components/common/status-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  isAppNavItemActive,
  navigationForRole,
  type AppNavItem,
} from '@/config/app-navigation'
import { useAppShellStore } from '@/store/use-app-shell-store'
import { useSession } from '@/hooks/use-auth'

function NavItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: AppNavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const { pathname } = useLocation()
  const active = isAppNavItemActive(item, pathname)

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      <item.icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {!collapsed && item.badge ? (
        <StatusBadge
          tone={item.badgeTone ?? 'critical'}
          label={item.badge}
          className="ml-auto"
        />
      ) : null}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="ml-1">
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }
  return link
}

/** Desktop sidebar: collapsible, keyboard navigable, tooltip when collapsed. */
export function AppSidebar() {
  const collapsed = useAppShellStore((state) => state.sidebarCollapsed)
  const session = useSession()
  const navigation = navigationForRole(session?.user.role)

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 hidden h-svh shrink-0 flex-col border-r bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
      aria-label="Application navigation"
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b',
          collapsed ? 'justify-center px-0' : 'px-4',
        )}
      >
        <Link
          to="/app/dashboard"
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {collapsed ? (
            <span
              className="text-lg font-bold text-primary"
              aria-label="CareGrid.io — dashboard"
            >
              CG
            </span>
          ) : (
            <CareGridLogo />
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.id} className="mb-5">
            {collapsed ? (
              <div
                className="mx-1 mb-3 h-px bg-border"
                aria-hidden="true"
              />
            ) : (
              <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItem item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn('shrink-0 border-t', collapsed ? 'px-2 py-4' : 'px-4 py-4')}>
        <p
          className={cn(
            'text-center text-[11px] leading-snug text-muted-foreground/70',
            collapsed && 'sr-only',
          )}
        >
          Demo frontend · No real backend.
        </p>
      </div>
    </aside>
  )
}