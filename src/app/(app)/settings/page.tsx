import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CreditCard, LogOut, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ManageSubscriptionButton } from '@/components/app/manage-subscription-button'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { priceIdToTier, priceTierLabel } from '@/lib/stripe/config'

export const metadata = { title: 'Settings' }

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }, tier] = await Promise.all([
    supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('subscriptions')
      .select('status, price_id, current_period_end, trial_end')
      .eq('user_id', user.id)
      .maybeSingle(),
    getUserTier(user.id),
  ])

  const isPremium = tier === 'premium'
  const planTier = priceIdToTier(subscription?.price_id ?? null)
  const planLabel = planTier ? priceTierLabel(planTier) : 'Premium'
  const planPrice = planTier === 'yearly' ? '$59.99 / yr' : '$9.99 / mo'
  const isTrialing = subscription?.status === 'trialing'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.status === 'canceled'
  const trialEndDate = formatDate(subscription?.trial_end ?? null)
  const renewalDate = formatDate(subscription?.current_period_end ?? null)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account, subscription, and sign out.
        </p>
      </header>

      <div className="mt-8 space-y-6">
        {/* ── Account ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="text-muted-foreground h-4 w-4" aria-hidden />
              Account
            </CardTitle>
            <CardDescription>Your sign-in email and basic profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Email
              </span>
              <p className="text-sm">{profile?.email ?? user.email}</p>
            </div>
            {profile?.full_name && (
              <div className="grid gap-1">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Name
                </span>
                <p className="text-sm">{profile.full_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Subscription ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="text-muted-foreground h-4 w-4" aria-hidden />
              Subscription
            </CardTitle>
            <CardDescription>
              {isPremium
                ? 'You have an active Premium subscription.'
                : "You're on the Free plan."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div className="bg-primary/5 border-primary/20 flex flex-wrap items-baseline justify-between gap-2 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-semibold">{planLabel}</p>
                    <p className="text-muted-foreground text-xs">{planPrice}</p>
                  </div>
                  <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {isTrialing ? 'Trialing' : 'Active'}
                  </span>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {isTrialing && trialEndDate && (
                    <div className="grid gap-0.5">
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Trial ends
                      </dt>
                      <dd>{trialEndDate}</dd>
                    </div>
                  )}
                  {renewalDate && (
                    <div className="grid gap-0.5">
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        {isTrialing ? 'First charge' : 'Next billing date'}
                      </dt>
                      <dd>{renewalDate}</dd>
                    </div>
                  )}
                </dl>

                <ManageSubscriptionButton variant="outline" className="w-full sm:w-auto">
                  Manage subscription
                </ManageSubscriptionButton>
                <p className="text-muted-foreground text-xs">
                  Update your card, switch monthly ↔ yearly, or cancel anytime.
                </p>
              </>
            ) : (
              <>
                {isPastDue && (
                  <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
                    Your last payment failed. Update your card to keep Premium.
                  </div>
                )}
                {isCanceled && (
                  <div className="text-muted-foreground bg-muted/50 rounded-lg border p-3 text-sm">
                    Your previous Premium subscription has ended. Re-subscribe
                    anytime — your tracking history is preserved.
                  </div>
                )}
                <p className="text-sm">
                  Upgrade to unlock a personalized 5–7 supplement protocol,
                  monthly meal plan, member discounts, and unlimited coach access.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/pricing">See Premium</Link>
                  </Button>
                  {isPastDue && (
                    <ManageSubscriptionButton variant="outline">
                      Update payment method
                    </ManageSubscriptionButton>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Sign out ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LogOut className="text-muted-foreground h-4 w-4" aria-hidden />
              Sign out
            </CardTitle>
            <CardDescription>End your current session on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-muted-foreground text-xs">
          Need help? Email{' '}
          <a href="mailto:support@longevity.app" className="underline">
            support@longevity.app
          </a>
          .
        </p>
      </div>
    </div>
  )
}
