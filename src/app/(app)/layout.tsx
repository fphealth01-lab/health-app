import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AppShell, type AppShellUser } from '@/components/app/app-shell'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Defense in depth — middleware should already have redirected, but if it
  // didn't (e.g. matcher bypass), refuse to render the shell.
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, email')
    .eq('id', user.id)
    .maybeSingle()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  const planLabel =
    subscription?.status === 'active' || subscription?.status === 'trialing'
      ? 'Premium plan'
      : 'Free plan'

  const shellUser: AppShellUser = {
    email: profile?.email ?? user.email ?? '',
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    planLabel,
  }

  return <AppShell user={shellUser}>{children}</AppShell>
}
