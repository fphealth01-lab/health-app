/**
 * Maps meal names to curated local food photos in /public/meal-photos/.
 *
 * Uses a three-tier priority scan so the main protein always wins over side
 * ingredients: "Baked Salmon with Garlic Roasted Asparagus" → salmon.jpg,
 * never vegetables.jpg.
 *
 * Within each tier, longer keywords are tested first so "overnight oats"
 * beats "oats", "protein shake" beats "shake", etc.
 *
 * Photo variant selection is deterministic: the same meal name always
 * returns the same image, but two meals sharing a keyword may show
 * different variants (base vs "1" file).
 */

// ── Tier 1: Proteins (always win — they're the hero of the dish) ──────────
const PROTEIN_KEYWORDS: Record<string, string[]> = {
  salmon: ['/meal-photos/salmon.jpg', '/meal-photos/salmon1.jpg'],
  shrimp: ['/meal-photos/shrimp.jpg', '/meal-photos/shrimp1.jpg'],
  prawn: ['/meal-photos/shrimp.jpg', '/meal-photos/shrimp1.jpg'],
  tuna: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  cod: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  tilapia: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  halibut: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  mackerel: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  sardine: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  trout: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  fish: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  seafood: ['/meal-photos/fish.jpg', '/meal-photos/fish1.jpg'],
  chicken: ['/meal-photos/chicken.jpg', '/meal-photos/chicken1.jpg'],
  turkey: ['/meal-photos/chicken.jpg', '/meal-photos/chicken1.jpg'],
  poultry: ['/meal-photos/chicken.jpg', '/meal-photos/chicken1.jpg'],
  beef: ['/meal-photos/beef.jpg', '/meal-photos/beef1.jpg'],
  steak: ['/meal-photos/beef.jpg', '/meal-photos/beef1.jpg'],
  pork: ['/meal-photos/beef.jpg', '/meal-photos/beef1.jpg'],
  lamb: ['/meal-photos/beef.jpg', '/meal-photos/beef1.jpg'],
  bison: ['/meal-photos/beef.jpg', '/meal-photos/beef1.jpg'],
  venison: ['/meal-photos/beef.jpg', '/meal-photos/beef1.jpg'],
  tofu: ['/meal-photos/tofu.jpg', '/meal-photos/tofu1.jpg'],
  tempeh: ['/meal-photos/tofu.jpg', '/meal-photos/tofu1.jpg'],
  seitan: ['/meal-photos/tofu.jpg', '/meal-photos/tofu1.jpg'],
  frittata: ['/meal-photos/omelette.jpg', '/meal-photos/omelette1.jpg'],
  omelette: ['/meal-photos/omelette.jpg', '/meal-photos/omelette1.jpg'],
  omelet: ['/meal-photos/omelette.jpg', '/meal-photos/omelette1.jpg'],
  scramble: ['/meal-photos/eggs.jpg', '/meal-photos/eggs1.jpg'],
  eggs: ['/meal-photos/eggs.jpg', '/meal-photos/eggs1.jpg'],
  egg: ['/meal-photos/eggs.jpg', '/meal-photos/eggs1.jpg'],
}

// ── Tier 2: Distinctive bases (win if no protein found) ───────────────────
// "Oatmeal with Berries" → oatmeal, not fruit
const BASE_KEYWORDS: Record<string, string[]> = {
  'overnight oats': ['/meal-photos/oatmeal.jpg', '/meal-photos/oatmeal1.jpg'],
  'protein shake': ['/meal-photos/smoothie.jpg', '/meal-photos/smoothie1.jpg'],
  porridge: ['/meal-photos/oatmeal.jpg', '/meal-photos/oatmeal1.jpg'],
  oatmeal: ['/meal-photos/oatmeal.jpg', '/meal-photos/oatmeal1.jpg'],
  granola: ['/meal-photos/oatmeal.jpg', '/meal-photos/oatmeal1.jpg'],
  muesli: ['/meal-photos/oatmeal.jpg', '/meal-photos/oatmeal1.jpg'],
  oats: ['/meal-photos/oatmeal.jpg', '/meal-photos/oatmeal1.jpg'],
  smoothie: ['/meal-photos/smoothie.jpg', '/meal-photos/smoothie1.jpg'],
  shake: ['/meal-photos/smoothie.jpg', '/meal-photos/smoothie1.jpg'],
  parfait: ['/meal-photos/yogurt.jpg', '/meal-photos/yogurt1.jpg'],
  yogurt: ['/meal-photos/yogurt.jpg', '/meal-photos/yogurt1.jpg'],
  kefir: ['/meal-photos/yogurt.jpg', '/meal-photos/yogurt1.jpg'],
  bisque: ['/meal-photos/soup.jpg', '/meal-photos/soup1.jpg'],
  broth: ['/meal-photos/soup.jpg', '/meal-photos/soup1.jpg'],
  'stir-fry': ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  'stir fry': ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  chili: ['/meal-photos/soup.jpg', '/meal-photos/soup1.jpg'],
  stew: ['/meal-photos/soup.jpg', '/meal-photos/soup1.jpg'],
  soup: ['/meal-photos/soup.jpg', '/meal-photos/soup1.jpg'],
  spaghetti: ['/meal-photos/pasta.jpg', '/meal-photos/pasta1.jpg'],
  linguine: ['/meal-photos/pasta.jpg', '/meal-photos/pasta1.jpg'],
  noodles: ['/meal-photos/pasta.jpg', '/meal-photos/pasta1.jpg'],
  penne: ['/meal-photos/pasta.jpg', '/meal-photos/pasta1.jpg'],
  pasta: ['/meal-photos/pasta.jpg', '/meal-photos/pasta1.jpg'],
  orzo: ['/meal-photos/pasta.jpg', '/meal-photos/pasta1.jpg'],
  risotto: ['/meal-photos/rice.jpg', '/meal-photos/rice1.jpg'],
  quinoa: ['/meal-photos/quinoa.jpg', '/meal-photos/quinoa1.jpg'],
  salad: ['/meal-photos/salad.jpg', '/meal-photos/salad1.jpg'],
  bowl: ['/meal-photos/quinoa.jpg', '/meal-photos/quinoa1.jpg'],
  rice: ['/meal-photos/rice.jpg', '/meal-photos/rice1.jpg'],
  cottage: ['/meal-photos/cheese.jpg', '/meal-photos/cheese1.jpg'],
  cheese: ['/meal-photos/cheese.jpg', '/meal-photos/cheese1.jpg'],
  feta: ['/meal-photos/cheese.jpg', '/meal-photos/cheese1.jpg'],
}

// ── Tier 3: Side ingredients (last resort before fallback) ────────────────
// "Roasted Vegetable Plate" → vegetables (no protein or base matched)
const SIDE_KEYWORDS: Record<string, string[]> = {
  'pumpkin seed': ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  'sunflower seed': ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  cauliflower: ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  blueberry: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  strawberry: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  asparagus: ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  pistachio: ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  vegetable: ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  broccoli: ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  arugula: ['/meal-photos/salad.jpg', '/meal-photos/salad1.jpg'],
  spinach: ['/meal-photos/salad.jpg', '/meal-photos/salad1.jpg'],
  berries: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  roasted: ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  avocado: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  veggies: ['/meal-photos/vegetables.jpg', '/meal-photos/vegetables1.jpg'],
  cashew: ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  walnut: ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  banana: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  almond: ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  orange: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  greens: ['/meal-photos/salad.jpg', '/meal-photos/salad1.jpg'],
  mango: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  apple: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  pecan: ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  berry: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  fruit: ['/meal-photos/fruit.jpg', '/meal-photos/fruit1.jpg'],
  nuts: ['/meal-photos/nuts.jpg', '/meal-photos/nuts1.jpg'],
  kale: ['/meal-photos/salad.jpg', '/meal-photos/salad1.jpg'],
}

// Pre-sort each tier longest-first so multi-word keywords match before
// their shorter sub-strings (e.g. "overnight oats" before "oats").
const PROTEIN_KEYS = Object.keys(PROTEIN_KEYWORDS).sort((a, b) => b.length - a.length)
const BASE_KEYS = Object.keys(BASE_KEYWORDS).sort((a, b) => b.length - a.length)
const SIDE_KEYS = Object.keys(SIDE_KEYWORDS).sort((a, b) => b.length - a.length)

const FALLBACK_PHOTOS = ['/meal-photos/plate.jpg', '/meal-photos/plate1.jpg']

/**
 * Deterministic hash of a string → non-negative integer.
 * Same input always returns the same number so meal photos never flicker.
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pickVariant(variants: string[], seed: string): string {
  return variants[hashString(seed) % variants.length]!
}

/**
 * Returns a deterministic local photo path for a given meal name.
 *
 * Scans three priority tiers so the main protein always wins:
 *   Tier 1 (proteins) → Tier 2 (bases) → Tier 3 (sides) → fallback plate
 *
 * @example
 * getMealPhoto('Baked Salmon with Garlic Roasted Asparagus') // salmon.jpg ✓
 * getMealPhoto('Oatmeal with Berries')                       // oatmeal.jpg ✓
 * getMealPhoto('Roasted Vegetable Bowl')                     // quinoa.jpg ✓
 */
export function getMealPhoto(mealName: string): string {
  const name = mealName.toLowerCase()

  for (const keyword of PROTEIN_KEYS) {
    if (name.includes(keyword)) return pickVariant(PROTEIN_KEYWORDS[keyword]!, name)
  }

  for (const keyword of BASE_KEYS) {
    if (name.includes(keyword)) return pickVariant(BASE_KEYWORDS[keyword]!, name)
  }

  for (const keyword of SIDE_KEYS) {
    if (name.includes(keyword)) return pickVariant(SIDE_KEYWORDS[keyword]!, name)
  }

  return pickVariant(FALLBACK_PHOTOS, name)
}
