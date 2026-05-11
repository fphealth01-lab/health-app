import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { features } from '@/config/features'
import {
  listConversations,
  getConversationMessages,
  createConversation,
  getRemainingMessages,
} from '@/lib/actions/coach'
import type { MessageRow } from '@/lib/actions/coach'
import { CoachChat } from '@/components/app/coach/coach-chat'
import { RATE_LIMIT_FREE, RATE_LIMIT_PREMIUM } from '@/lib/ai/coach'

export const metadata: Metadata = { title: 'Coach' }

export default async function CoachPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!features.aiCoachEnabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">Coach coming soon</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          We&apos;re putting the finishing touches on your personalized health coach. Check back
          shortly.
        </p>
      </div>
    )
  }

  // Get user profile and tier in parallel
  const [profile, tier] = await Promise.all([
    supabase
      .from('profiles')
      .select('primary_goal, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()
      .then((r) => r.data),
    getUserTier(user.id),
  ])

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Load conversations + usage
  const [conversations, { used }] = await Promise.all([
    tier === 'premium' ? listConversations() : Promise.resolve([]),
    getRemainingMessages(user.id),
  ])

  // Determine initial conversation
  // Premium: use most recent or create one
  // Free: use most recent or create one (but no sidebar)
  let initialConversationId: string | null = null
  let initialMessages: MessageRow[] = []

  if (conversations.length > 0) {
    initialConversationId = conversations[0]!.id
    initialMessages = await getConversationMessages(initialConversationId)
  } else {
    // Create a new conversation eagerly so the user can start chatting
    const newConv = await createConversation()
    initialConversationId = newConv.id
    conversations.unshift(newConv)
  }

  const rateLimit = tier === 'premium' ? RATE_LIMIT_PREMIUM : RATE_LIMIT_FREE
  const remaining = Math.max(0, rateLimit - used)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen">
      <CoachChat
        userId={user.id}
        tier={tier}
        goal={profile.primary_goal}
        initialConversations={tier === 'premium' ? conversations : []}
        initialConversationId={initialConversationId}
        initialMessages={initialMessages}
        initialRemaining={remaining}
        rateLimit={rateLimit}
      />
    </div>
  )
}
