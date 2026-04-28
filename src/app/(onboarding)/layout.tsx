import type { ReactNode } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

/**
 * Layout for the post-signup quiz and the protocol reveal screen. Wider than
 * the auth card layout, with a subtle warm-cream gradient backdrop and a
 * small logo in the corner.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="from-secondary/20 min-h-screen flex-1 bg-gradient-to-b via-transparent to-transparent">
      <header className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <span className="bg-primary text-primary-foreground inline-flex h-7 w-7 items-center justify-center rounded-md">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="font-semibold tracking-tight">Longevity</span>
        </Link>
      </header>
      <main className="px-4 pb-16 pt-4 sm:px-6 sm:pt-8 sm:pb-20">{children}</main>
    </div>
  )
}
