'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

type NavLink = { href: string; label: string }

/** Full marketing nav — shown to logged-out visitors. */
const MARKETING_NAV: NavLink[] = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#science', label: 'Science' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Articles' },
  { href: '/supplements', label: 'Supplements' },
]

/** Content links shown to all authenticated users. */
const CONTENT_NAV: NavLink[] = [
  { href: '/blog', label: 'Articles' },
  { href: '/supplements', label: 'Supplements' },
]

/** Pricing link added for free users so they can discover the upgrade path. */
const PRICING_LINK: NavLink = { href: '/pricing', label: 'Pricing' }

function getNavLinks(isAuthenticated: boolean, isPremium: boolean): NavLink[] {
  if (!isAuthenticated) return MARKETING_NAV
  if (isPremium) return CONTENT_NAV
  return [...CONTENT_NAV, PRICING_LINK]
}

interface SiteHeaderProps {
  /** Passed from the (marketing) layout after a server-side auth check. */
  isAuthenticated?: boolean
  /** True when the user has an active/trialing subscription. */
  isPremium?: boolean
}

export function SiteHeader({ isAuthenticated = false, isPremium = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const navLinks = getNavLinks(isAuthenticated, isPremium)

  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-primary text-primary-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg">Lyvewell</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard →</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Build my protocol</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[18rem]">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-2 flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 px-4">
              {isAuthenticated ? (
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/dashboard">Dashboard →</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link href="/signup">Build my protocol</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
