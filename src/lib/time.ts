const MINUTE_MS = 60_000
const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

/** Compact relative time label: "Just now", "5m ago", "2h ago", "Yesterday". */
export function timeAgo(input: string | Date): string {
  const then = typeof input === 'string' ? new Date(input) : input
  const diff = Date.now() - then.getTime()
  if (diff < MINUTE_MS) return 'Just now'
  if (diff < HOUR_MS) return `${Math.round(diff / MINUTE_MS)}m ago`
  if (diff < DAY_MS) return `${Math.round(diff / HOUR_MS)}h ago`
  const days = Math.round(diff / DAY_MS)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}

/** True when `input` falls within the trailing `minutes` window from now. */
export function isWithinMinutes(input: string | Date, minutes: number): boolean {
  const then = typeof input === 'string' ? new Date(input) : input
  return Date.now() - then.getTime() <= minutes * MINUTE_MS
}