import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { CookieBanner } from '@/components/marketing/cookie-banner'

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  let isAuthenticated = false
  let isPremium = false
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      isAuthenticated = true
      const tier = await getUserTier(user.id)
      isPremium = tier === 'premium'
    }
  } catch {
    // non-fatal — header falls back to the logged-out state
  }

  return (
    <>
      <SiteHeader isAuthenticated={isAuthenticated} isPremium={isPremium} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </>
  )
}
