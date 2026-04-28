import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Onboarding' }

export default function OnboardingPage() {
  return (
    <Card className="bg-card border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome aboard</CardTitle>
        <CardDescription>Onboarding quiz coming next prompt.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          We&apos;ll ask a few questions about your goals, lifestyle, and current routine to build
          your personalized protocol.
        </p>
        <Button asChild className="w-full">
          <Link href="/dashboard">Skip to dashboard for now</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
