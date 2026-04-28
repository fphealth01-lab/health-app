import type { Goal } from '@/types/user'

/**
 * Onboarding quiz schema — single source of truth.
 *
 * Each question maps to a column on `public.profiles`. The question array is
 * authoritative: change order, copy, or options here and the UI updates
 * automatically. Adding a new question requires also adding the column to the
 * schema (migration) and to the `QuizAnswers` type below.
 */

// ── Option / question types ────────────────────────────────────────────────
export interface SelectOption {
  value: string
  label: string
  /** Optional emoji or short string rendered alongside the label. */
  icon?: string
  /** Optional description shown under the label. */
  description?: string
}

interface BaseQuestion {
  id: string
  title: string
  subtitle?: string
  required: boolean
  /** Maps to the column on `public.profiles` we'll write to on submit. */
  field: keyof QuizAnswers
}

export interface SingleSelectQuestion extends BaseQuestion {
  type: 'single_select'
  options: SelectOption[]
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi_select'
  options: SelectOption[]
  /**
   * Value of the option that means "none" / "I'd rather not say". When this
   * option is selected, all other selections are cleared and disabled.
   */
  noneValue?: string
}

export interface SliderQuestion extends BaseQuestion {
  type: 'slider'
  min: number
  max: number
  step: number
  defaultValue: number
  /** Labels shown at the extremes (e.g. "exhausted" / "energized"). */
  minLabel: string
  maxLabel: string
}

export type QuizQuestion = SingleSelectQuestion | MultiSelectQuestion | SliderQuestion

// ── Answer shape (what the QuizContainer collects in state) ────────────────
export interface QuizAnswers {
  primary_goal: Goal | null
  sex: 'male' | 'female' | 'other' | null
  /** Stored as the midpoint of the selected age bucket (e.g., '25-34' → 30). */
  age: number | null
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  baseline_energy: number | null
  baseline_sleep_quality: number | null
  baseline_stress: number | null
  dietary_preference:
    | 'omnivore'
    | 'vegetarian'
    | 'vegan'
    | 'pescatarian'
    | 'keto'
    | 'carnivore'
    | null
  medical_conditions: string[]
  current_supplements: string[]
}

export const initialQuizAnswers: QuizAnswers = {
  primary_goal: null,
  sex: null,
  age: null,
  activity_level: null,
  baseline_energy: null,
  baseline_sleep_quality: null,
  baseline_stress: null,
  dietary_preference: null,
  medical_conditions: [],
  current_supplements: [],
}

// ── The 10 questions ───────────────────────────────────────────────────────
export const onboardingQuestions: QuizQuestion[] = [
  {
    id: 'q1_primary_goal',
    type: 'single_select',
    field: 'primary_goal',
    title: "What's your main health goal?",
    subtitle: "We'll personalize your protocol around this.",
    required: true,
    options: [
      { value: 'testosterone', label: 'Boost testosterone & energy', icon: '⚡️' },
      { value: 'sleep', label: 'Improve sleep quality', icon: '🌙' },
      { value: 'skin', label: 'Better skin & anti-aging', icon: '✨' },
      { value: 'energy', label: 'More daily energy', icon: '🔋' },
      { value: 'focus', label: 'Sharper focus & cognition', icon: '🧠' },
      { value: 'longevity', label: 'General longevity & wellness', icon: '🌱' },
    ],
  },
  {
    id: 'q2_sex',
    type: 'single_select',
    field: 'sex',
    title: "What's your biological sex?",
    subtitle: 'Some supplements work differently based on hormones and body composition.',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other / prefer not to say' },
    ],
  },
  {
    id: 'q3_age',
    type: 'single_select',
    field: 'age',
    title: 'How old are you?',
    required: true,
    // value is the midpoint of the bucket, stored as a string in state and
    // coerced to int on submit (the QuizContainer/server action handles this).
    options: [
      { value: '22', label: 'Under 25' },
      { value: '30', label: '25–34' },
      { value: '40', label: '35–44' },
      { value: '50', label: '45–54' },
      { value: '60', label: '55–64' },
      { value: '70', label: '65+' },
    ],
  },
  {
    id: 'q4_activity_level',
    type: 'single_select',
    field: 'activity_level',
    title: 'How active are you on a typical week?',
    required: true,
    options: [
      { value: 'sedentary', label: 'Sedentary', description: 'mostly sitting' },
      { value: 'light', label: 'Light', description: 'some walking or movement daily' },
      { value: 'moderate', label: 'Moderate', description: 'exercise 2–3× per week' },
      { value: 'active', label: 'Active', description: 'exercise 4–5× per week' },
      {
        value: 'very_active',
        label: 'Very active',
        description: 'athlete or physical labor',
      },
    ],
  },
  {
    id: 'q5_energy',
    type: 'slider',
    field: 'baseline_energy',
    title: 'How would you rate your energy lately?',
    subtitle: '1 = exhausted all day, 10 = bouncing off the walls',
    required: true,
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 5,
    minLabel: 'Exhausted',
    maxLabel: 'High energy',
  },
  {
    id: 'q6_sleep_quality',
    type: 'slider',
    field: 'baseline_sleep_quality',
    title: 'How well are you sleeping?',
    subtitle: '1 = barely sleep / never refreshed, 10 = excellent every night',
    required: true,
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 5,
    minLabel: 'Poor',
    maxLabel: 'Excellent',
  },
  {
    id: 'q7_stress',
    type: 'slider',
    field: 'baseline_stress',
    title: 'How stressed are you on a typical day?',
    subtitle: '1 = totally relaxed, 10 = overwhelmed and burnt out',
    required: true,
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 5,
    minLabel: 'Relaxed',
    maxLabel: 'Overwhelmed',
  },
  {
    id: 'q8_dietary_preference',
    type: 'single_select',
    field: 'dietary_preference',
    title: 'How do you typically eat?',
    required: true,
    options: [
      { value: 'omnivore', label: 'Omnivore', description: 'no restrictions' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'pescatarian', label: 'Pescatarian', description: 'fish but no meat' },
      { value: 'keto', label: 'Keto', description: 'low-carb, high-fat' },
      { value: 'carnivore', label: 'Carnivore', description: 'animal products only' },
    ],
  },
  {
    id: 'q9_medical_conditions',
    type: 'multi_select',
    field: 'medical_conditions',
    title: 'Do any of these apply to you?',
    subtitle: 'We use this to flag interactions and avoid risky recommendations.',
    required: false,
    noneValue: 'none',
    options: [
      { value: 'high_blood_pressure', label: 'High blood pressure' },
      { value: 'type_2_diabetes', label: 'Type 2 diabetes' },
      { value: 'thyroid_disorder', label: 'Thyroid disorder' },
      { value: 'anxiety_depression', label: 'Anxiety / depression' },
      {
        value: 'on_prescription',
        label: 'Currently on prescription medication',
      },
      { value: 'pregnant_or_breastfeeding', label: 'Pregnant or breastfeeding' },
      { value: 'none', label: 'None of these' },
    ],
  },
  {
    id: 'q10_current_supplements',
    type: 'multi_select',
    field: 'current_supplements',
    title: 'What supplements are you already taking?',
    subtitle: 'Optional — helps us avoid redundant recommendations.',
    required: false,
    noneValue: 'none',
    options: [
      { value: 'vitamin_d', label: 'Vitamin D' },
      { value: 'magnesium', label: 'Magnesium' },
      { value: 'fish_oil', label: 'Fish oil / Omega-3' },
      { value: 'multivitamin', label: 'Multivitamin' },
      { value: 'creatine', label: 'Creatine' },
      { value: 'protein_powder', label: 'Protein powder' },
      { value: 'probiotics', label: 'Probiotics' },
      { value: 'b_complex', label: 'B-complex' },
      { value: 'rather_not_say', label: "I'd rather not say" },
      { value: 'none', label: 'None' },
    ],
  },
]
