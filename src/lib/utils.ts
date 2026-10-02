export { cn } from 'cn'

/** Initials (max two parts) used for avatar fallbacks. */
export function userInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}