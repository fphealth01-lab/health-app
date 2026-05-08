import Link from 'next/link'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtocolEmptyStateProps {
  /** When true the user finished onboarding but has no saved protocol row yet. */
  onboardingComplete: boolean
}

export function ProtocolEmptyState({ onboardingComplete }: ProtocolEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="bg-primary/10 text-primary inline-flex h-16 w-16 items-center justify-center rounded-2xl">
        <FlaskConical className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">No protocol yet</h2>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
          {onboardingComplete
            ? "We couldn't find a saved protocol for your account. Generate one from your profile answers."
            : 'Complete the onboarding quiz so we can build your personalised supplement stack.'}
        </p>
      </div>
      <Button asChild>
        <Link href={onboardingComplete ? '/onboarding/reveal' : '/onboarding'}>
          {onboardingComplete ? 'Generate my protocol' : 'Start onboarding'}
        </Link>
      </Button>
    </div>
  )
}
