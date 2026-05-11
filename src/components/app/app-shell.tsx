'use client'

import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AppSidebar } from './app-sidebar'

export interface AppShellUser {
  email: string
  fullName: string | null
  avatarUrl: string | null
  planLabel: string
}

export function AppShell({ children, user }: { children: ReactNode; user: AppShellUser }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bg-background flex min-h-screen flex-1">
      <div className="hidden w-64 shrink-0 lg:block">
        <AppSidebar user={user} />
      </div>

      <div className="flex flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <AppSidebar user={user} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold tracking-tight">Lyvewell</span>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
