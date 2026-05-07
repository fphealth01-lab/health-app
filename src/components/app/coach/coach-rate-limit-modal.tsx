'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface CoachRateLimitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoachRateLimitModal({ open, onOpenChange }: CoachRateLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <Zap className="text-primary h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Daily limit reached</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;ve used all 5 free messages for today. Upgrade to Premium for unlimited daily
            messages and full conversation memory.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p className="mb-2 font-medium">Premium includes:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>✓ Unlimited daily messages</li>
              <li>✓ Full conversation history &amp; memory</li>
              <li>✓ Claude Sonnet (more detailed responses)</li>
              <li>✓ Personalized context from your protocol</li>
              <li>✓ Protocol change suggestions</li>
            </ul>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link href="/pricing">Upgrade to Premium</Link>
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe tomorrow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
