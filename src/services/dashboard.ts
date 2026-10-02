import type { ActivityEvent, DashboardOverview } from '@/types/dashboard'

export type { DashboardOverview, ActivityEvent }

/**
 * Dashboard data service contract. The UI reads everything through this
 * interface (via React Query at the page level), so a Spring Boot REST
 * implementation can replace the mock later with the exact same shape.
 *
 * The notification feed lives in its own service (`notificationService`) so
 * the topbar popover, the notification centre and the dashboard never load two
 * copies of the same data.
 */
export interface DashboardService {
  /** Combined operational overview for the dashboard landing view. */
  getOverview(): Promise<DashboardOverview>
  /** Fictional recent activity timeline for the dashboard. */
  getRecentActivity(): Promise<ActivityEvent[]>
}
