import type { Goal } from './user'

export interface ProtocolItem {
  supplement_id: string
  supplement_name: string
  dose_mg: number
  timing: string
  reasoning: string
  citations?: string[]
}

export interface Protocol {
  id: string
  user_id: string
  goal: Goal
  items: ProtocolItem[]
  is_personalized: boolean
  generated_at: string
  last_updated: string
}
