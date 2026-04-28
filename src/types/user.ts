export type Sex = 'male' | 'female' | 'other'
export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'pescatarian'
export type Goal = 'testosterone' | 'sleep' | 'skin' | 'energy' | 'focus' | 'longevity'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface UserProfile {
  id: string
  user_id: string
  age?: number
  sex?: Sex
  weight_kg?: number
  primary_goal?: Goal
  secondary_goals?: Goal[]
  dietary_preference?: DietaryPreference
  current_supplements?: string[]
  medications?: string[]
  conditions?: string[]
  activity_level?: ActivityLevel
  created_at: string
  updated_at: string
}
