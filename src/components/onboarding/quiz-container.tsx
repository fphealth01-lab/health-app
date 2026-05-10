'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import {
  initialQuizAnswers,
  onboardingQuestions,
  type QuizAnswers,
  type QuizQuestion,
} from '@/config/onboarding-quiz'
import { features } from '@/config/features'
import { submitOnboarding } from '@/lib/actions/onboarding'
import { QuizProgressBar } from './progress-bar'
import { QuestionRenderer } from './question-renderer'
import { LoadingScreen } from './loading-screen'
import { ResumePrompt } from './resume-prompt'

const STORAGE_KEY = 'onboarding_quiz_state'
const AUTO_ADVANCE_MS = 220
const MIN_LOADING_MS = 4000

interface SavedState {
  answers: QuizAnswers
  currentStep: number
}

type Mode = 'resume_prompt' | 'quiz' | 'loading'

function isAnswered(question: QuizQuestion, answers: QuizAnswers): boolean {
  if (!question.required) return true
  const value = answers[question.field]
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'number') return Number.isFinite(value)
  return value !== null && value !== undefined
}

function loadSavedState(): SavedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedState
    if (!parsed.answers || typeof parsed.currentStep !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function QuizContainer() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('quiz')
  const [answers, setAnswers] = useState<QuizAnswers>(initialQuizAnswers)
  const [step, setStep] = useState(0)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fire onboarding_started once per quiz session (not once per page load —
  // resuming from saved state doesn't count as "starting" again).
  const hasTrackedStart = useRef(false)

  // Hydrate from localStorage exactly once. Defer to a resume prompt so users
  // who genuinely want to start over aren't railroaded into stale answers.
  useEffect(() => {
    const saved = loadSavedState()
    if (saved) {
      setMode('resume_prompt')
    } else if (!hasTrackedStart.current && posthog.__loaded) {
      posthog.capture('onboarding_started')
      hasTrackedStart.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist after every change. We also persist an empty start so a "Back"
  // navigation never accidentally drops state mid-quiz.
  useEffect(() => {
    if (mode !== 'quiz') return
    if (typeof window === 'undefined') return
    const payload: SavedState = { answers, currentStep: step }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [answers, step, mode])

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [])

  function clearStorage() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  function resumeSaved() {
    const saved = loadSavedState()
    if (saved) {
      setAnswers(saved.answers)
      setStep(Math.min(saved.currentStep, onboardingQuestions.length - 1))
    }
    setMode('quiz')
  }

  function discardSaved() {
    clearStorage()
    setAnswers(initialQuizAnswers)
    setStep(0)
    setMode('quiz')
  }

  function handleAnswer(field: keyof QuizAnswers, value: QuizAnswers[keyof QuizAnswers]) {
    setAnswers((prev) => ({ ...prev, [field]: value }))

    // Single-select questions auto-advance for snappy feel. Multi-select and
    // sliders wait for an explicit "Next" so the user can refine.
    const question = onboardingQuestions[step]
    if (question?.type === 'single_select') {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      autoAdvanceTimer.current = setTimeout(() => {
        if (step < onboardingQuestions.length - 1) {
          setStep((s) => s + 1)
        }
      }, AUTO_ADVANCE_MS)
    }
  }

  function goNext() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    if (step < onboardingQuestions.length - 1) {
      setStep((s) => s + 1)
    } else {
      void completeQuiz()
    }
  }

  function goBack() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    if (step > 0) setStep((s) => s - 1)
  }

  async function completeQuiz() {
    setMode('loading')

    // Run server save + minimum visual delay in parallel so the experience
    // never feels jarringly fast (or shows loading after the work is done).
    const [, result] = await Promise.all([
      new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
      submitOnboarding(answers),
    ])

    if (!result.ok) {
      toast.error(result.error)
      setMode('quiz')
      return
    }

    clearStorage()

    if (features.postQuizPaywallEnabled) {
      router.push('/onboarding/reveal')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  if (mode === 'resume_prompt') {
    return <ResumePrompt onResume={resumeSaved} onDiscard={discardSaved} />
  }

  if (mode === 'loading') {
    return <LoadingScreen />
  }

  const question = onboardingQuestions[step]
  if (!question) return null
  const canAdvance = isAnswered(question, answers)
  const isLast = step === onboardingQuestions.length - 1

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-8 flex items-center gap-3">
        {step > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="text-muted-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div className="h-9" />
        )}
      </div>

      <QuizProgressBar current={step + 1} total={onboardingQuestions.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mt-8 space-y-6"
        >
          <header className="space-y-2">
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {question.title}
            </h1>
            {question.subtitle && (
              <p className="text-muted-foreground text-balance">{question.subtitle}</p>
            )}
          </header>

          <QuestionRenderer
            question={question}
            answers={answers}
            onAnswer={handleAnswer}
          />

          <div className="pt-2">
            <Button
              onClick={goNext}
              size="lg"
              disabled={!canAdvance}
              className="w-full sm:w-auto"
            >
              {isLast ? 'See my protocol' : 'Continue'}
              {!isLast && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
