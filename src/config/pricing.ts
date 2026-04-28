export interface PricingTier {
  name: string
  price: number
  annual_price?: number
  interval: 'month' | null
  features: string[]
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    interval: null,
    features: [
      'Basic 3-supplement protocol',
      'Track up to 5 supplements',
      '5 AI questions per day',
      'Full content library',
    ],
  },
  {
    name: 'Premium',
    price: 9.99,
    annual_price: 59.99,
    interval: 'month',
    features: [
      'Personalized 5-7 supplement protocol',
      'Monthly personalized meal plan',
      'Member supplement discounts (15-30% off)',
      'Unlimited AI coach with memory',
      'Advanced tracking & weekly reports',
      'Bloodwork analysis (coming soon)',
      'Ad-free experience',
    ],
  },
]
