/** Time-of-day greeting used by the dashboard page header. */
export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 5) return 'Good evening'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}