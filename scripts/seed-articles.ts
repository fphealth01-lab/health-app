/**
 * scripts/seed-articles.ts
 *
 * Generates 15 starter articles using Claude and pushes them to Sanity.
 *
 * BEFORE RUNNING:
 *   1. Generate a Sanity write token:
 *      https://sanity.io/manage/project/he8pdycr → API → Tokens → "Add API token"
 *      Name: "seed-articles" | Permission: Editor
 *   2. Add to .env.local:  SANITY_API_TOKEN=skXXX...
 *   3. Restart your terminal if needed so the env var is loaded.
 *
 * COST: ~$1–2 in Anthropic API calls (15 articles × claude-sonnet-4-5)
 *
 * RUN:
 *   npx tsx scripts/seed-articles.ts
 */

import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { createClient as createSanityClient } from '@sanity/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// ── Env validation ────────────────────────────────────────────────────────

const required = [
  'SANITY_API_TOKEN',
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]
for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n❌  Missing env var: ${key}`)
    if (key === 'SANITY_API_TOKEN') {
      console.error(
        '   Generate one at: https://sanity.io/manage/project/he8pdycr → API → Tokens',
      )
    }
    process.exit(1)
  }
}

// ── Clients ────────────────────────────────────────────────────────────────

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2025-05-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

// ── Types ─────────────────────────────────────────────────────────────────

type BlockContent = { type: string; text?: string; tone?: string; slug?: string; quote?: string; attribution?: string }

interface ArticleSpec {
  title: string
  category: string
  goals: string[]
  supplementSlugs: string[] // catalog slugs to reference in body
}

// ── Helpers ───────────────────────────────────────────────────────────────

function key() {
  return randomUUID().replace(/-/g, '').slice(0, 12)
}

function toPortableText(blocks: BlockContent[]) {
  const result: object[] = []
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
      case 'h2':
      case 'h3': {
        const style = block.type === 'paragraph' ? 'normal' : block.type
        result.push({
          _type: 'block',
          _key: key(),
          style,
          children: [{ _type: 'span', _key: key(), text: block.text ?? '', marks: [] }],
          markDefs: [],
        })
        break
      }
      case 'callout': {
        result.push({
          _type: 'articleCallout',
          _key: key(),
          tone: block.tone ?? 'info',
          content: [
            {
              _type: 'block',
              _key: key(),
              style: 'normal',
              children: [{ _type: 'span', _key: key(), text: block.text ?? '', marks: [] }],
              markDefs: [],
            },
          ],
        })
        break
      }
      case 'supplement_card': {
        result.push({
          _type: 'supplementReferenceCard',
          _key: key(),
          supplementSlug: block.slug ?? '',
        })
        break
      }
      case 'pull_quote': {
        result.push({
          _type: 'pullQuote',
          _key: key(),
          quote: block.quote ?? '',
          attribution: block.attribution ?? '',
        })
        break
      }
    }
  }
  return result
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Returns a deterministic picsum image URL based on slug */
function picsumUrl(slug: string, width = 800, height = 450) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/${width}/${height}`
}

/** Spreads 15 articles across the past 30 days */
function publishedAt(index: number, total: number) {
  const msPerSlot = (30 * 24 * 60 * 60 * 1000) / total
  const d = new Date(Date.now() - msPerSlot * (total - index))
  return d.toISOString()
}

// ── Sanity document upsert helpers ────────────────────────────────────────

async function upsertDocument(doc: Record<string, unknown> & { _type: string; _id: string }) {
  try {
    await sanity.createOrReplace(doc)
    return doc._id
  } catch (err) {
    console.error(`  createOrReplace failed for ${doc._id}:`, err)
    throw err
  }
}

async function ensureAuthor(): Promise<string> {
  const authorId = 'author-sarah-chen'
  await upsertDocument({
    _type: 'author',
    _id: authorId,
    name: 'Dr. Sarah Chen',
    credentials: 'MS, Registered Dietitian',
    bio: 'Dr. Sarah Chen is a registered dietitian specializing in nutritional biochemistry and longevity supplementation. She has spent over 10 years reviewing clinical research on micronutrients, adaptogens, and evidence-based supplement protocols.',
    slug: { _type: 'slug', current: 'dr-sarah-chen' },
  })
  console.log('  ✓ Author: Dr. Sarah Chen')
  return authorId
}

async function ensureGoals(): Promise<Record<string, string>> {
  const goals = [
    { id: 'goal-testosterone', title: 'Testosterone', slug: 'testosterone' },
    { id: 'goal-sleep', title: 'Sleep', slug: 'sleep' },
    { id: 'goal-skin', title: 'Skin', slug: 'skin' },
    { id: 'goal-energy', title: 'Energy', slug: 'energy' },
  ]
  const map: Record<string, string> = {}
  for (const goal of goals) {
    await upsertDocument({
      _type: 'goal',
      _id: goal.id,
      title: goal.title,
      slug: { _type: 'slug', current: goal.slug },
    })
    map[goal.slug] = goal.id
  }
  console.log('  ✓ Goals: testosterone, sleep, skin, energy')
  return map
}

async function ensureCategories(): Promise<Record<string, string>> {
  const cats = [
    { id: 'cat-testosterone', title: 'Testosterone', slug: 'testosterone' },
    { id: 'cat-sleep', title: 'Sleep', slug: 'sleep' },
    { id: 'cat-skin', title: 'Skin', slug: 'skin' },
  ]
  const map: Record<string, string> = {}
  for (const cat of cats) {
    await upsertDocument({
      _type: 'category',
      _id: cat.id,
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
    })
    map[cat.slug] = cat.id
  }
  console.log('  ✓ Categories: Testosterone, Sleep, Skin')
  return map
}

// ── Article generation ────────────────────────────────────────────────────

async function generateArticle(spec: ArticleSpec, supplementCatalog: string[]) {
  const supplementList = supplementCatalog.slice(0, 30).join(', ')

  const systemPrompt = `You are a registered dietitian writing science-backed supplement articles for a longevity health platform.
Write in a clear, evidence-based tone — informative but accessible. Avoid hype.
Always include real PubMed citations (use actual study titles and DOI/PMID links you know).`

  const userPrompt = `Write an article with this title: "${spec.title}"

Category: ${spec.category}
Goals: ${spec.goals.join(', ')}
Supplements catalog (slugs available): ${supplementList}
Reference 2–4 of these supplement slugs: ${spec.supplementSlugs.join(', ')}

Return a JSON object with exactly this structure (no markdown fences, just raw JSON):
{
  "meta_title": "60 chars max SEO title",
  "meta_description": "155 chars max meta description",
  "excerpt": "1–2 sentence summary",
  "body": [
    // Array of content blocks. Types:
    // {"type":"h2","text":"..."} 
    // {"type":"paragraph","text":"..."}
    // {"type":"callout","tone":"info|warning|tip","text":"Key takeaway sentence"}
    // {"type":"supplement_card","slug":"<catalog-slug>"}  (use 2–4 times)
    // {"type":"pull_quote","quote":"...","attribution":"Author Name or Study"}
  ],
  "citations": [
    {"title":"Full study title","url":"https://pubmed.ncbi.nlm.nih.gov/PMID"}
  ],
  "supplements_mentioned": ["slug1","slug2"]
}

Requirements:
- Body: 700–1000 words across paragraphs (count carefully)
- Include exactly 1 callout block with the key takeaway
- Include 2–4 supplement_card blocks referencing real slugs from the catalog
- Include 2–3 real PubMed citations
- End body with a paragraph CTA: "Build your personalized protocol" 
- meta_title must be ≤60 chars
- meta_description must be ≤155 chars`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Strip markdown fences if Claude wraps in them anyway
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  let parsed: {
    meta_title: string
    meta_description: string
    excerpt: string
    body: BlockContent[]
    citations: { title: string; url: string }[]
    supplements_mentioned: string[]
  }

  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('  JSON parse failed. Raw response:\n', text.slice(0, 500))
    throw new Error('Failed to parse Claude response as JSON')
  }

  return parsed
}

// ── Article specs ─────────────────────────────────────────────────────────

const ARTICLES: ArticleSpec[] = [
  // Testosterone (5)
  {
    title: 'The 5 Best Supplements for Testosterone (Backed by Research)',
    category: 'testosterone',
    goals: ['testosterone'],
    supplementSlugs: ['zinc-picolinate', 'vitamin-d3', 'tongkat-ali', 'ashwagandha'],
  },
  {
    title: 'How to Naturally Increase Testosterone in Your 40s',
    category: 'testosterone',
    goals: ['testosterone', 'energy'],
    supplementSlugs: ['zinc-picolinate', 'tongkat-ali', 'vitamin-d3'],
  },
  {
    title: 'Tongkat Ali: The Real Science (Not Bro Science)',
    category: 'testosterone',
    goals: ['testosterone'],
    supplementSlugs: ['tongkat-ali', 'zinc-picolinate'],
  },
  {
    title: 'Why Your Vitamin D Levels Affect Testosterone',
    category: 'testosterone',
    goals: ['testosterone', 'energy'],
    supplementSlugs: ['vitamin-d3', 'zinc-picolinate'],
  },
  {
    title: 'Zinc and Testosterone: How Much Do You Actually Need?',
    category: 'testosterone',
    goals: ['testosterone'],
    supplementSlugs: ['zinc-picolinate', 'magnesium-glycinate'],
  },
  // Sleep (5)
  {
    title: 'Magnesium for Sleep: Glycinate vs Citrate vs Threonate',
    category: 'sleep',
    goals: ['sleep'],
    supplementSlugs: ['magnesium-glycinate', 'l-theanine', 'glycine'],
  },
  {
    title: 'L-Theanine: How a Tea Extract Improves Sleep Quality',
    category: 'sleep',
    goals: ['sleep', 'energy'],
    supplementSlugs: ['l-theanine', 'magnesium-glycinate'],
  },
  {
    title: 'Sleep Stack Protocol: A Science-Backed 4-Supplement Approach',
    category: 'sleep',
    goals: ['sleep'],
    supplementSlugs: ['magnesium-glycinate', 'l-theanine', 'glycine', 'apigenin'],
  },
  {
    title: 'Why Apigenin Beats Melatonin for Most Adults',
    category: 'sleep',
    goals: ['sleep'],
    supplementSlugs: ['apigenin', 'magnesium-glycinate'],
  },
  {
    title: 'The Science of Glycine and Deep Sleep',
    category: 'sleep',
    goals: ['sleep'],
    supplementSlugs: ['glycine', 'magnesium-glycinate', 'l-theanine'],
  },
  // Skin (5)
  {
    title: 'Collagen Peptides: Do They Actually Work?',
    category: 'skin',
    goals: ['skin'],
    supplementSlugs: ['collagen-peptides', 'vitamin-c', 'astaxanthin'],
  },
  {
    title: 'NMN, Resveratrol, and the Aging Skin Connection',
    category: 'skin',
    goals: ['skin'],
    supplementSlugs: ['nmn', 'resveratrol', 'collagen-peptides'],
  },
  {
    title: 'Vitamin C: Topical vs Oral for Skin Health',
    category: 'skin',
    goals: ['skin'],
    supplementSlugs: ['vitamin-c', 'collagen-peptides', 'astaxanthin'],
  },
  {
    title: 'The Best Antioxidant Supplements for Anti-Aging',
    category: 'skin',
    goals: ['skin'],
    supplementSlugs: ['astaxanthin', 'vitamin-c', 'resveratrol'],
  },
  {
    title: 'Astaxanthin: The Most Underrated Skin Supplement',
    category: 'skin',
    goals: ['skin'],
    supplementSlugs: ['astaxanthin', 'collagen-peptides'],
  },
]

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Seed Articles Script')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️   This will use ~$1–2 of Anthropic API credits')
  console.log('     15 articles × claude-sonnet-4-5\n')

  // 1. Get supplement slugs from Supabase to pass to Claude
  const { data: supplementRows } = await supabase.from('supplements').select('slug, name')
  const supplementCatalog = (supplementRows ?? []).map((s) => s.slug)
  if (supplementCatalog.length === 0) {
    console.warn('⚠️  No supplements found in Supabase. Slugs in articles may not resolve.')
  } else {
    console.log(`  Found ${supplementCatalog.length} supplements in catalog`)
  }

  // 2. Ensure Sanity taxonomy documents exist
  console.log('\n📦  Creating taxonomy documents...')
  const [authorId, goalMap, categoryMap] = await Promise.all([
    ensureAuthor(),
    ensureGoals(),
    ensureCategories(),
  ])

  // 3. Generate articles one at a time
  console.log(`\n✍️   Generating ${ARTICLES.length} articles (this takes ~10 min)...\n`)
  let successCount = 0

  for (let i = 0; i < ARTICLES.length; i++) {
    const spec = ARTICLES[i]
    const articleSlug = slugify(spec.title)
    console.log(`[${i + 1}/${ARTICLES.length}] ${spec.title}`)

    try {
      const generated = await generateArticle(spec, supplementCatalog)

      const categoryId = categoryMap[spec.category]
      const goalRefs = spec.goals.map((g) => ({
        _type: 'reference',
        _key: key(),
        _ref: goalMap[g] ?? `goal-${g}`,
      }))

      const docId = `article-${articleSlug}`
      await upsertDocument({
        _type: 'article',
        _id: docId,
        title: spec.title,
        slug: { _type: 'slug', current: articleSlug },
        excerpt: generated.excerpt,
        featured_image_url: picsumUrl(articleSlug),
        author: { _type: 'reference', _ref: authorId },
        category: { _type: 'reference', _ref: categoryId },
        goals: goalRefs,
        supplements_mentioned: generated.supplements_mentioned ?? spec.supplementSlugs,
        body: toPortableText(generated.body ?? []),
        meta_title: generated.meta_title?.slice(0, 60),
        meta_description: generated.meta_description?.slice(0, 155),
        published_at: publishedAt(i, ARTICLES.length),
      })

      console.log(`  ✓ Published → /blog/${articleSlug}`)
      successCount++
    } catch (err) {
      console.error(`  ✗ Failed: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Small delay between API calls to avoid rate limits
    if (i < ARTICLES.length - 1) {
      await new Promise((r) => setTimeout(r, 1500))
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅  Done: ${successCount}/${ARTICLES.length} articles created in Sanity`)
  console.log(`\nNext steps:`)
  console.log(`  1. Visit http://localhost:3000/blog to see the articles`)
  console.log(`  2. Open /studio to review and polish the content`)
  console.log(`  3. Replace placeholder images pre-launch with real photography`)
  console.log(`  4. Verify 2–3 citations per article are real PubMed links\n`)
}

main().catch((err) => {
  console.error('\n💥  Fatal error:', err)
  process.exit(1)
})
