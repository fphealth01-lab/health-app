'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import posthog from 'posthog-js'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupValues = z.infer<typeof signupSchema>

/** Whitelist of safe `next` paths the auth callback can redirect to.
 *  Prevents an attacker turning the signup link into an open redirect. */
function sanitizeNext(raw: string | null): string | null {
  if (!raw) return null
  // Only allow same-origin paths.
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export function SignupForm() {
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))
  const plan = searchParams.get('plan')
  const [isPending, setIsPending] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: SignupValues) {
    setIsPending(true)
    setErrorMessage(null)

    const supabase = createClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    // Thread the upgrade-resume params through the email confirmation link
    // so that after the user clicks the email and lands on /auth/callback,
    // we redirect them back to /pricing?plan=… and they can finish checkout
    // in one click.
    const callbackParams = new URLSearchParams()
    if (next) {
      const dest = plan ? `${next}?plan=${encodeURIComponent(plan)}` : next
      callbackParams.set('next', dest)
    }
    const callbackQuery = callbackParams.toString()
    const emailRedirectTo = `${siteUrl}/auth/callback${callbackQuery ? `?${callbackQuery}` : ''}`

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo,
      },
    })

    setIsPending(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    // Track sign-up attempt — Supabase returns success even if the email
    // already exists (to prevent user enumeration), so we fire the event
    // whenever we get a non-error response (i.e. confirmation email sent).
    if (posthog.__loaded) {
      posthog.capture('user_signed_up', { method: 'email' })
    }

    setSubmittedEmail(values.email)
  }

  if (submittedEmail) {
    return (
      <Alert className="border-primary/30 bg-primary/5">
        <Mail className="h-4 w-4" />
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          We sent a confirmation link to <strong>{submittedEmail}</strong>. Click the link to
          finish creating your account. You can close this tab.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t create your account</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use 8+ characters with a mix of letters and numbers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </Form>
  )
}
