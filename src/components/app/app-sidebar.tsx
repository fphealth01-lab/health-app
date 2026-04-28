'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Pill,
  LineChart,
  MessagesSquare,
  UtensilsCrossed,
  Settings,
  Sparkles,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { AppShellUser } from './app-shell'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/protocol', label: 'Protocol', icon: Pill },
  { href: '/tracker', label: 'Tracker', icon: LineChart },
  { href: '/coach', label: 'AI Coach', icon: MessagesSquare },
  { href: '/meal-plan', label: 'Meal Plan', icon: UtensilsCrossed },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface AppSidebarProps {
  user: AppShellUser
  onNavigate?: () => void
}

function getInitials(user: AppShellUser): string {
  const source = user.fullName?.trim() || user.email
  if (!source) return 'U'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function AppSidebar({ user, onNavigate }: AppSidebarProps) {
  const pathname = usePathname()
  const initials = getInitials(user)
  const displayName = user.fullName?.trim() || user.email

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-full w-full flex-col border-r">
      <div className="px-5 py-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="bg-primary text-primary-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg">Longevity</span>
        </Link>
      </div>
      <Separator />

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />
      <div className="space-y-3 px-3 py-4">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-9 w-9">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={displayName}>
              {displayName}
            </p>
            <p className="text-muted-foreground truncate text-xs">{user.planLabel}</p>
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className={cn(
              'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            )}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
