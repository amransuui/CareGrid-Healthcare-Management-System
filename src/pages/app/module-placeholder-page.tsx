import { Construction } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { EmptyState } from '@/components/common/empty-state'
import { Container } from '@/components/common/container'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { findAppNavItem } from '@/config/app-navigation'

/**
 * Clean "coming in the next phase" state for modules that are not part of
 * the shell yet. Titles resolve from the navigation config, so every future
 * route gets a coherent placeholder without broken links.
 */
export function ModulePlaceholderPage() {
  const { pathname } = useLocation()
  const match = findAppNavItem(pathname)
  const title = match?.item.label ?? 'This section'
  const Icon = match?.item.icon ?? Construction

  return (
    <Container size="fluid" className="max-w-5xl space-y-4 py-6">
      <PageHeader title={title} description="Planned module" />
      <Card className="shadow-card">
        <CardContent>
          <EmptyState
            icon={Icon}
            title={`${title} is coming in a next phase`}
            description="The application shell, navigation and dashboard are live. This module ships with its own data, forms and workflows in a later phase."
            action={
              <Button asChild>
                <Link to="/app/dashboard">Back to dashboard</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </Container>
  )
}