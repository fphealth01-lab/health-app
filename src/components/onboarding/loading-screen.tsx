'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const messages = [
  'Analyzing your goals…',
  'Reviewing peer-reviewed research…',
  'Selecting your top supplements…',
  'Building your protocol…',
] as const

const PER_MESSAGE_MS = 1100

/**
 * Anticipation-builder shown while the server action saves the profile and
 * creates the user's protocol. Cycles through 4 messages over ~4 seconds.
 */
export function LoadingScreen() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length)
    }, PER_MESSAGE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
        <motion.span
          aria-hidden
          className="bg-primary/15 absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden
          className="bg-primary/20 absolute inset-2 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.2, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <span className="bg-primary text-primary-foreground relative flex h-14 w-14 items-center justify-center rounded-full">
          <Sparkles className="h-7 w-7" aria-hidden />
        </span>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Building your protocol
      </h2>

      <div className="mt-4 h-7 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.p
            key={messages[index]}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-muted-foreground"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
