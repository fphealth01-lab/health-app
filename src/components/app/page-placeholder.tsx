import type { ReactNode } from 'react'

interface PagePlaceholderProps {
  title: string
  description: string
  children?: ReactNode
}

/**
 * Lightweight scaffold for app pages we haven't implemented yet.
 * Gives each route a real layout so we can navigate around the shell.
 */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="bg-card mt-8 rounded-2xl border p-8 sm:p-12">
        <div className="mx-auto max-w-md text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold">
            soon
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Coming next prompt</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            This page is intentionally a placeholder. We&apos;ll build it out feature-by-feature in
            upcoming sessions.
          </p>
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  )
}
