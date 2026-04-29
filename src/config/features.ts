/**
 * Feature flags for controlling free vs premium behavior.
 * Toggle these to change product behavior without code changes elsewhere.
 */
export const features = {
  /**
   * After completing the onboarding quiz, show the paywall preview screen
   * (`/onboarding/reveal`) before the dashboard. Set to false to send users
   * straight to /dashboard after the quiz.
   */
  postQuizPaywallEnabled: true,

  /**
   * Master toggle for the AI protocol generator. When false, the onboarding
   * flow falls back to the hardcoded goal-to-supplement map (the Step 2
   * behavior). Useful for local dev when you don't want to spend tokens.
   */
  aiProtocolGenerationEnabled: true,

  /**
   * When true, paying users get the premium tier (Sonnet, 5–7 supplements,
   * per-supplement reasoning, citations). When false, ALL users get the free
   * tier regardless of subscription status — used until subscription gating
   * is wired in Step 5.
   */
  premiumPersonalizedProtocolEnabled: false,

  // Future flags (placeholder for Step 5+):
  premiumQuizQuestionsEnabled: false, // 30 deep questions for premium
  premiumMealPlanEnabled: false,
  premiumBloodworkAnalysisEnabled: false,
  premiumUnlimitedAiChatEnabled: false,
} as const

export type FeatureFlag = keyof typeof features
