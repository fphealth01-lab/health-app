'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  title: string
  url: string
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Share:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X / Twitter"
      >
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs font-medium">
          𝕏
        </Button>
      </a>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
      >
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs font-medium">
          in
        </Button>
      </a>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={copyLink}
        aria-label={copied ? 'Link copied!' : 'Copy link'}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" aria-hidden />
        ) : (
          <Link2 className="h-3.5 w-3.5" aria-hidden />
        )}
      </Button>
    </div>
  )
}
