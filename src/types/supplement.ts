export type SupplementTiming =
  | 'morning'
  | 'evening'
  | 'with_food'
  | 'empty_stomach'
  | 'before_bed'
  | 'flexible'

export interface SupplementCitation {
  title: string
  url: string
}

export interface SupplementBrand {
  brand: string
  affiliate_url: string
}

export interface SupplementBrandsByRegion {
  us?: SupplementBrand[]
  eu?: SupplementBrand[]
  ro?: SupplementBrand[]
  global?: SupplementBrand[]
}

export interface Supplement {
  id: string
  name: string
  category: string
  benefits: string[]
  dosing_low_mg?: number
  dosing_high_mg?: number
  timing: SupplementTiming
  interactions: string[]
  contraindications: string[]
  citations: SupplementCitation[]
  brands_per_region: SupplementBrandsByRegion
}
