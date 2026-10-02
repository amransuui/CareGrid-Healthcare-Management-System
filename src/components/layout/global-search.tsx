import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import type { UserRole } from '@/types/auth'
import { appNavigation, navigationForRole } from '@/config/app-navigation'
import { useSession } from '@/hooks/use-auth'

interface SearchEntry {
  label: string
  href: string
  groupLabel: string
  icon: (typeof appNavigation)[number]['items'][number]['icon']
}

function buildSearchEntries(role: UserRole | undefined): SearchEntry[] {
  return navigationForRole(role).flatMap((group) =>
    group.items.map((item) => ({
      label: item.label,
      href: item.href,
      groupLabel: group.label,
      icon: item.icon,
    })),
  )
}

/**
 * Global search foundation. Matches navigation sections/items with keyboard
 * navigation (arrows + Enter, Ctrl/⌘K to open). No backend search yet.
 */
export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const session = useSession()
  const searchEntries = buildSearchEntries(session?.user.role)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 pl-2 text-muted-foreground sm:w-44 lg:w-56"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Search care modules…</span>
        <span className="hidden items-center rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground lg:inline-flex">
          Ctrl K
        </span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search modules, sections…" />
        <CommandList>
          <CommandEmpty>No sections found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {searchEntries.map((entry) => (
              <CommandItem
                key={entry.href}
                value={`${entry.label} ${entry.groupLabel} ${entry.href}`}
                onSelect={() => {
                  navigate(entry.href)
                  setOpen(false)
                }}
              >
                <entry.icon aria-hidden="true" />
                <span>{entry.label}</span>
                <CommandShortcut>{entry.groupLabel}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}