'use client'

import { useTransition } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RegenerateButtonProps {
  remainingRegenerations: number
  onRegenerate: () => void
  isLoading?: boolean
}

export function RegenerateButton({
  remainingRegenerations,
  onRegenerate,
  isLoading = false,
}: RegenerateButtonProps) {
  const isDisabled = remainingRegenerations <= 0 || isLoading

  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={onRegenerate}
      disabled={isDisabled}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Generating…' : 'Regenerate plan'}
    </Button>
  )

  if (remainingRegenerations <= 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{button}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>No regenerations left this week. Resets next Monday.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {button}
      <span className="text-xs text-muted-foreground">
        {remainingRegenerations} of 4 left this week
      </span>
    </div>
  )
}
