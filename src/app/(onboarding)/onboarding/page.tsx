import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuizContainer } from '@/components/onboarding/quiz-container'

export const metadata = { title: 'Build your protocol' }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // If onboarding is already done, send the user to the dashboard rather than
  // letting them silently re-take the quiz and overwrite their protocol.
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  return <QuizContainer />
}
