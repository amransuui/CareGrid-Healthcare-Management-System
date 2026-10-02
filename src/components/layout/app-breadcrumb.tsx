import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { findAppNavItem } from '@/config/app-navigation'

/**
 * Route-derived breadcrumbs. Trails follow the application navigation
 * config (section + item), rooted at the CareGrid.io dashboard.
 */
export function AppBreadcrumb() {
  const { pathname } = useLocation()
  const match = findAppNavItem(pathname)

  const currentLabel =
    match?.item.label ?? (pathname === '/app' ? 'Dashboard' : 'Section')

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/app/dashboard">CareGrid.io</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {match && match.group.label !== 'Overview' && match.group.label !== currentLabel ? (
          <>
            <BreadcrumbItem>
              <span className="text-muted-foreground">{match.group.label}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}