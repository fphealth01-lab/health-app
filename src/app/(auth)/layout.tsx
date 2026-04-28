import type { ReactNode } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="from-secondary/30 flex min-h-screen flex-1 flex-col bg-gradient-to-b via-transparent to-transparent">
      <header className="px-4 py-6 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-primary text-primary-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg">Longevity</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
