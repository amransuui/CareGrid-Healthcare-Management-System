import type { DashboardService } from '@/services/dashboard'
import { dashboardOverview } from '@/data/mock/dashboard'
import { recentActivityData } from '@/data/mock/activity'

/**
 * Frontend/demo-only dashboard implementation. Returns centralized mock
 * data through a small simulated latency so real loading states are
 * exercised. Note: the dashboard exposes no need for latencies — read-only
 * demo data is fine to be fetched through React Query like a REST client.
 */
const SIMULATED_LATENCY_MS = 450

const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export const mockDashboardService: DashboardService = {
  async getOverview() {
    await delay()
    return dashboardOverview
  },
  async getRecentActivity() {
    await delay()
    return recentActivityData
  },
}