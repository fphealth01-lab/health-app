import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>
      <div className="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-3xl prose-h1:text-teal-700 prose-h2:text-teal-700 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline max-w-none">
        {children}
      </div>
    </div>
  )
}
