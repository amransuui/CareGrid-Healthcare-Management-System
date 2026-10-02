import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { roleLabels } from '@/data/mock/demo-users'
import { useLogout, useSession } from '@/hooks/use-auth'
import { userInitials } from '@/lib/utils'

/** Topbar user controls: avatar, name, role and account menu with logout. */
export function UserMenu() {
  const session = useSession()
  const logout = useLogout()
  const user = session?.user

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 px-1.5"
          aria-label={`Account menu for ${user.fullName}`}
        >
          <Avatar className="size-7">
            <AvatarFallback>{userInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left md:block">
            <span className="block text-sm leading-tight font-medium">
              {user.fullName}
            </span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {roleLabels[user.role]}
            </span>
          </span>
          <ChevronDown
            className="hidden size-3.5 text-muted-foreground md:block"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{user.fullName}</span>
          <span className="block text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/app/settings">
            <UserRound aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/settings">
            <Settings aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}