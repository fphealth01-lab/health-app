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

  // Future flags (placeholder for Step 5+):
  premiumQuizQuestionsEnabled: false, // 30 deep questions for premium
  premiumMealPlanEnabled: false,
  premiumBloodworkAnalysisEnabled: false,
  premiumUnlimitedAiChatEnabled: false,
} as const

export type FeatureFlag = keyof typeof features
