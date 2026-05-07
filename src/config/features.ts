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
   * per-supplement reasoning, citations). When false, ALL users are forced
   * to the free tier regardless of subscription status. Flip OFF as a
   * kill-switch if Sonnet costs spike or quality regresses.
   */
  premiumPersonalizedProtocolEnabled: true,

  /**
   * Master toggle for the Stripe checkout flow. When false, the /pricing
   * upgrade buttons + the upsell CTAs are disabled (we render a
   * "Coming soon" state instead). Useful if Stripe goes down or we need to
   * pause new charges. Existing subscriptions are unaffected.
   */
  stripeCheckoutEnabled: true,

  /**
   * Master toggle for the AI Chat Coach (/coach). When false, the /coach
   * page shows a "coming soon" state. Flip OFF as a kill-switch if costs
   * spike or Claude is unavailable.
   */
  aiCoachEnabled: true,

  /**
   * Master toggle for the Meal Plan Generator (/meal-plan). When false,
   * /meal-plan shows a "coming soon" placeholder. Flip OFF if Claude costs
   * spike or meal plan generation is broken.
   */
  mealPlanEnabled: true,

  /**
   * When true, premium users get the full 7-day AI-generated meal plan.
   * When false, ALL users see the free preview/paywall regardless of subscription.
   * Use as a kill-switch without touching the DB.
   */
  premiumMealPlanEnabled: true,

  // Future flags (placeholder for later steps):
  premiumQuizQuestionsEnabled: false, // 30 deep questions for premium
  premiumBloodworkAnalysisEnabled: false,
  premiumUnlimitedAiChatEnabled: false,
} as const

export type FeatureFlag = keyof typeof features
