import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SignupForm } from '@/components/forms/signup-form'

export const metadata = { title: 'Sign up' }

function SignupFormFallback() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}

export default function SignupPage() {
  return (
    <Card className="bg-card border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start your free 3-supplement protocol in minutes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Suspense fallback={<SignupFormFallback />}>
          <SignupForm />
        </Suspense>
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
