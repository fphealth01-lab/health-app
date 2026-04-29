import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { isAdminUser } from '@/lib/auth/admin'

export const metadata = { title: 'Admin' }

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = await isAdminUser()
  if (!isAdmin) {
    // Don't leak the existence of /admin to non-admins — bounce them as if
    // the route were protected the same way as /dashboard.
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex-1 bg-neutral-50/40 dark:bg-neutral-950">
      <header className="border-b bg-white px-4 py-3 sm:px-6 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Shield className="text-primary h-4 w-4" aria-hidden />
            Admin
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/admin/ai-costs"
              className="text-muted-foreground hover:text-foreground"
            >
              AI costs
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Back to app
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
