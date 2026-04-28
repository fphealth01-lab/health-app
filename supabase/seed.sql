-- ============================================================================
-- Longevity Platform — Seed: starter supplement catalog
-- ============================================================================
-- 40 supplements covering Testosterone & Energy, Sleep & Recovery, Skin &
-- Anti-aging, plus 3 region-specific brand rows for each (us / eu / global).
--
-- Apply manually via the Supabase Dashboard:
--   Project → SQL Editor → paste this entire file → Run
-- (The supabase CLI's `db reset` would wipe production data, so we don't use
-- it on the linked project.)
--
-- Citations point to PubMed search URLs so they always resolve to relevant
-- literature; brand affiliate URLs are placeholders (rcode=PLACEHOLDER) to be
-- replaced once real partnerships are signed.
-- ============================================================================

begin;

-- Make the seed re-runnable without duplicating rows.
delete from public.supplement_brands;
delete from public.supplements;

-- ============================================================================
-- Supplements
-- ============================================================================
insert into public.supplements
  (slug, name, category, short_description, benefits, goals_targeted,
   dosing_low_mg, dosing_high_mg, dosing_unit, timing, interactions, contraindications, citations)
values
-- ── Testosterone & Energy ──────────────────────────────────────────────────
('vitamin-d3', 'Vitamin D3', 'vitamin',
  'Hormone-like vitamin tied to testosterone, mood, and immune function.',
  array['Supports healthy testosterone levels','Mood and immune support','Bone density'],
  array['testosterone','energy','longevity'],
  2000, 5000, 'IU', 'with_food',
  array['Calcium-channel blockers','Statins'],
  array['Hypercalcemia','Sarcoidosis'],
  '[{"title":"Effect of vitamin D supplementation on testosterone levels in men","journal":"Hormone and Metabolic Research","year":2011,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+D+testosterone+men+RCT"}]'::jsonb),

('magnesium-glycinate', 'Magnesium Glycinate', 'mineral',
  'The most bioavailable, gut-friendly magnesium form. Key for ~300 enzymes.',
  array['Improves sleep quality','Supports muscle and nerve function','Helps testosterone bioavailability'],
  array['testosterone','sleep','energy','longevity'],
  200, 400, 'mg', 'before_bed',
  array['Bisphosphonates','Tetracycline antibiotics'],
  array['Severe kidney disease'],
  '[{"title":"Effects of magnesium supplementation on testosterone levels of athletes and sedentary subjects at rest and after exhaustion","journal":"Biological Trace Element Research","year":2011,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+testosterone+RCT"}]'::jsonb),

('zinc-picolinate', 'Zinc Picolinate', 'mineral',
  'Cofactor for testosterone synthesis and immune function.',
  array['Supports testosterone production','Immune defense','Skin health'],
  array['testosterone','skin','longevity'],
  15, 40, 'mg', 'with_food',
  array['Copper (compete for absorption)','Quinolone antibiotics'],
  array['Long-term use without copper balance'],
  '[{"title":"Zinc status and serum testosterone levels of healthy adults","journal":"Nutrition","year":1996,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=zinc+testosterone+RCT"}]'::jsonb),

('boron', 'Boron', 'mineral',
  'Trace mineral that elevates free testosterone by lowering SHBG.',
  array['Increases free testosterone','Supports bone health','Reduces inflammation'],
  array['testosterone','longevity'],
  3, 10, 'mg', 'with_food',
  array['None significant at normal doses'],
  array['Pregnancy (high doses)'],
  '[{"title":"Comparative effects of daily and weekly boron supplementation on plasma steroid hormones and proinflammatory cytokines","journal":"Journal of Trace Elements in Medicine and Biology","year":2011,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=boron+free+testosterone"}]'::jsonb),

('ashwagandha', 'Ashwagandha (KSM-66)', 'adaptogen',
  'Adaptogenic herb shown to reduce cortisol and modestly raise testosterone.',
  array['Lowers stress and cortisol','Supports testosterone','Improves sleep'],
  array['testosterone','sleep','energy'],
  300, 600, 'mg', 'flexible',
  array['Sedatives','Thyroid medications','Immunosuppressants'],
  array['Pregnancy','Hyperthyroidism','Autoimmune conditions'],
  '[{"title":"Examining the effect of Withania somnifera supplementation on muscle strength and recovery: a randomized controlled trial","journal":"Journal of the International Society of Sports Nutrition","year":2015,"url":"https://pubmed.ncbi.nlm.nih.gov/26609282"},{"title":"A prospective, randomized double-blind, placebo-controlled study of safety and efficacy of a high-concentration full-spectrum extract of ashwagandha root in reducing stress and anxiety in adults","journal":"Indian Journal of Psychological Medicine","year":2012,"url":"https://pubmed.ncbi.nlm.nih.gov/23439798"}]'::jsonb),

('tongkat-ali', 'Tongkat Ali', 'adaptogen',
  'Eurycoma longifolia root extract — supports free testosterone and libido.',
  array['Raises free testosterone','Improves libido','Reduces stress'],
  array['testosterone','energy'],
  200, 400, 'mg', 'morning',
  array['Blood pressure medications','Diabetes medications'],
  array['Hormone-sensitive cancers','Pregnancy'],
  '[{"title":"Eurycoma longifolia as a potential adoptogen of male sexual health: a systematic review","journal":"Chinese Journal of Natural Medicines","year":2017,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=tongkat+ali+testosterone+systematic+review"}]'::jsonb),

('fadogia-agrestis', 'Fadogia Agrestis', 'adaptogen',
  'West African herb popularized by Andrew Huberman for testosterone support.',
  array['May raise testosterone (animal evidence)','Libido support'],
  array['testosterone'],
  400, 600, 'mg', 'morning',
  array['Hormone-sensitive medications'],
  array['Limited human safety data','Cycle 8 weeks on / 4 off'],
  '[{"title":"Aphrodisiac potential of Fadogia agrestis stem in male albino rats","journal":"Asian Journal of Andrology","year":2005,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=fadogia+agrestis+testosterone"}]'::jsonb),

('creatine-monohydrate', 'Creatine Monohydrate', 'amino_acid',
  'Most-researched ergogenic aid; benefits strength, power, and cognition.',
  array['Strength and lean mass','Cognitive performance','Cellular energy'],
  array['testosterone','energy','focus','longevity'],
  3000, 5000, 'mg', 'flexible',
  array['Caffeine (high doses may blunt effect)','NSAIDs (kidney load)'],
  array['Severe kidney disease'],
  '[{"title":"International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation","journal":"JISSN","year":2017,"url":"https://pubmed.ncbi.nlm.nih.gov/28615996"}]'::jsonb),

('omega-3-epa-dha', 'Omega-3 (EPA/DHA)', 'fatty_acid',
  'Anti-inflammatory marine omega-3s supporting heart, brain, and skin.',
  array['Cardiovascular health','Reduces inflammation','Supports brain and skin'],
  array['testosterone','skin','longevity','focus'],
  1000, 3000, 'mg', 'with_food',
  array['Anticoagulants (warfarin, aspirin)'],
  array['Bleeding disorders','Upcoming surgery'],
  '[{"title":"Omega-3 fatty acids and inflammatory processes: from molecules to man","journal":"Biochemical Society Transactions","year":2017,"url":"https://pubmed.ncbi.nlm.nih.gov/28900017"}]'::jsonb),

('tribulus-terrestris', 'Tribulus Terrestris', 'adaptogen',
  'Traditional libido herb. Strong on libido, mixed on testosterone.',
  array['Libido','Mood support'],
  array['testosterone'],
  500, 1500, 'mg', 'with_food',
  array['Lithium','Diuretics'],
  array['Hormone-sensitive conditions','Pregnancy'],
  '[{"title":"Effects of Tribulus terrestris on endocrine sensitive organs in male and female Wistar rats","journal":"Phytomedicine","year":2012,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=tribulus+terrestris+libido"}]'::jsonb),

('maca-root', 'Maca Root', 'adaptogen',
  'Andean root supporting energy, libido, and mood.',
  array['Energy and stamina','Libido','Mood balance'],
  array['testosterone','energy'],
  1500, 3000, 'mg', 'morning',
  array['Hormone-sensitive medications'],
  array['Thyroid disease (raw maca)'],
  '[{"title":"A systematic review on the effectiveness of maca on improving sexual dysfunction","journal":"BMC Complementary and Alternative Medicine","year":2010,"url":"https://pubmed.ncbi.nlm.nih.gov/20691074"}]'::jsonb),

('l-carnitine', 'L-Carnitine (Tartrate)', 'amino_acid',
  'Mitochondrial fuel transporter — supports recovery and androgen receptor density.',
  array['Exercise recovery','Fat metabolism','Androgen receptor sensitivity'],
  array['testosterone','energy'],
  1000, 2000, 'mg', 'with_food',
  array['Thyroid hormone','Anticoagulants'],
  array['Seizure disorders','Hypothyroidism (TMAO concerns)'],
  '[{"title":"Androgenic responses to resistance exercise: effects of feeding and L-carnitine","journal":"Medicine and Science in Sports and Exercise","year":2006,"url":"https://pubmed.ncbi.nlm.nih.gov/16826022"}]'::jsonb),

('vitamin-k2-mk7', 'Vitamin K2 (MK-7)', 'vitamin',
  'Directs calcium to bones and teeth; pairs with D3.',
  array['Bone density','Arterial health','Pairs with vitamin D3'],
  array['testosterone','longevity'],
  100, 200, 'mcg', 'with_food',
  array['Warfarin (significant)'],
  array['Anticoagulant therapy'],
  '[{"title":"Vitamin K2 supplementation improves hip bone geometry and bone strength indices in postmenopausal women","journal":"Osteoporosis International","year":2007,"url":"https://pubmed.ncbi.nlm.nih.gov/17287908"}]'::jsonb),

('selenium', 'Selenium', 'mineral',
  'Antioxidant trace mineral, critical for thyroid and reproductive health.',
  array['Thyroid function','Antioxidant defense','Sperm quality'],
  array['testosterone','longevity'],
  100, 200, 'mcg', 'with_food',
  array['None significant at normal doses'],
  array['Selenium toxicity above 400 mcg/day'],
  '[{"title":"Selenium and human health","journal":"The Lancet","year":2012,"url":"https://pubmed.ncbi.nlm.nih.gov/22381456"}]'::jsonb),

('b-complex', 'B-Complex', 'vitamin',
  'Full B-vitamin spectrum supporting energy production and methylation.',
  array['ATP production','Methylation support','Stress and mood'],
  array['energy','focus','longevity'],
  1, 1, 'tablet', 'morning',
  array['Levodopa (B6 reduces effect)'],
  array['None at standard doses'],
  '[{"title":"B vitamins and the brain: mechanisms, dose and efficacy — a review","journal":"Nutrients","year":2016,"url":"https://pubmed.ncbi.nlm.nih.gov/26828517"}]'::jsonb),

-- ── Sleep & Recovery ───────────────────────────────────────────────────────
('l-theanine', 'L-Theanine', 'amino_acid',
  'Green-tea amino acid that promotes calm focus without sedation.',
  array['Calm focus','Reduces anxiety','Improves sleep onset'],
  array['sleep','focus'],
  100, 400, 'mg', 'flexible',
  array['Stimulants (synergistic with caffeine)','Antihypertensives'],
  array['Hypotension'],
  '[{"title":"L-theanine, a natural constituent in tea, and its effect on mental state","journal":"Asia Pacific Journal of Clinical Nutrition","year":2008,"url":"https://pubmed.ncbi.nlm.nih.gov/18296328"}]'::jsonb),

('glycine', 'Glycine', 'amino_acid',
  'Inhibitory neurotransmitter that lowers core body temp before sleep.',
  array['Faster sleep onset','Improved sleep quality','Glutathione precursor'],
  array['sleep','longevity','skin'],
  3000, 5000, 'mg', 'before_bed',
  array['Clozapine'],
  array['None significant'],
  '[{"title":"The sleep-promoting and hypothermic effects of glycine are mediated by NMDA receptors in the suprachiasmatic nucleus","journal":"Neuropsychopharmacology","year":2015,"url":"https://pubmed.ncbi.nlm.nih.gov/25666625"}]'::jsonb),

('apigenin', 'Apigenin', 'plant_compound',
  'Flavone from chamomile that promotes deep sleep and lowers estrogen aromatization.',
  array['Promotes deep sleep','Calming','May lower aromatase'],
  array['sleep','testosterone'],
  50, 100, 'mg', 'before_bed',
  array['CYP3A4 substrates','Sedatives'],
  array['Pregnancy'],
  '[{"title":"Apigenin: a promising molecule for cancer prevention","journal":"Pharmaceutical Research","year":2010,"url":"https://pubmed.ncbi.nlm.nih.gov/20024611"}]'::jsonb),

('melatonin', 'Melatonin (low dose)', 'hormone',
  'Pineal hormone — low doses (0.3–1 mg) restore circadian timing without grogginess.',
  array['Sleep onset','Jet lag recovery','Antioxidant'],
  array['sleep','longevity'],
  0.3, 1, 'mg', 'before_bed',
  array['Anticoagulants','Immunosuppressants','Diabetes medications'],
  array['Autoimmune disease','Pregnancy'],
  '[{"title":"Meta-analysis: melatonin for the treatment of primary sleep disorders","journal":"PLoS One","year":2013,"url":"https://pubmed.ncbi.nlm.nih.gov/23691095"}]'::jsonb),

('gaba', 'GABA', 'amino_acid',
  'Inhibitory neurotransmitter — supports relaxation and stress recovery.',
  array['Relaxation','Reduces anxiety','Sleep support'],
  array['sleep'],
  100, 750, 'mg', 'before_bed',
  array['Sedatives','Antihypertensives'],
  array['Pregnancy'],
  '[{"title":"GABA from a natural source improves sleep quality","journal":"Journal of Clinical Biochemistry and Nutrition","year":2018,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=gaba+sleep+human+RCT"}]'::jsonb),

('5-htp', '5-HTP', 'amino_acid',
  'Direct serotonin precursor — supports mood and sleep.',
  array['Mood support','Sleep onset','Appetite regulation'],
  array['sleep'],
  50, 200, 'mg', 'before_bed',
  array['SSRIs (serotonin syndrome risk)','MAOIs','Tramadol'],
  array['Concurrent antidepressants'],
  '[{"title":"5-Hydroxytryptophan: a clinically-effective serotonin precursor","journal":"Alternative Medicine Review","year":1998,"url":"https://pubmed.ncbi.nlm.nih.gov/9727088"}]'::jsonb),

('tart-cherry-extract', 'Tart Cherry Extract', 'plant_compound',
  'Natural source of melatonin and anthocyanins; supports sleep and recovery.',
  array['Improves sleep duration','Reduces muscle soreness','Antioxidant'],
  array['sleep','longevity'],
  480, 480, 'mg', 'before_bed',
  array['Anticoagulants'],
  array['None significant'],
  '[{"title":"Effects of tart cherry juice on sleep and inflammation in older adults with insomnia","journal":"American Journal of Therapeutics","year":2018,"url":"https://pubmed.ncbi.nlm.nih.gov/28901958"}]'::jsonb),

('reishi-mushroom', 'Reishi Mushroom', 'adaptogen',
  'Ganoderma lucidum — calming adaptogen used for sleep and immunity.',
  array['Sleep support','Immune modulation','Stress resilience'],
  array['sleep','longevity'],
  1000, 2000, 'mg', 'evening',
  array['Anticoagulants','Antihypertensives','Immunosuppressants'],
  array['Bleeding disorders','Pre-surgery'],
  '[{"title":"Ganoderma lucidum (Lingzhi or Reishi): A medicinal mushroom","journal":"Herbal Medicine: Biomolecular and Clinical Aspects","year":2011,"url":"https://pubmed.ncbi.nlm.nih.gov/22593926"}]'::jsonb),

('lavender-extract', 'Lavender Extract (Silexan)', 'plant_compound',
  'Standardized lavender oil — comparable to anxiolytics in trials, sleep-friendly.',
  array['Reduces anxiety','Improves sleep quality','Mood'],
  array['sleep'],
  80, 160, 'mg', 'before_bed',
  array['Sedatives','CNS depressants'],
  array['Pregnancy'],
  '[{"title":"Silexan, an orally administered Lavandula oil preparation, is effective in the treatment of generalized anxiety disorder","journal":"International Clinical Psychopharmacology","year":2010,"url":"https://pubmed.ncbi.nlm.nih.gov/20512042"}]'::jsonb),

('magnesium-l-threonate', 'Magnesium L-Threonate', 'mineral',
  'Brain-bioavailable magnesium form — supports sleep depth and cognition.',
  array['Crosses the blood-brain barrier','Improves sleep depth','Cognition'],
  array['sleep','focus','longevity'],
  1000, 2000, 'mg', 'before_bed',
  array['Bisphosphonates','Tetracyclines'],
  array['Severe kidney disease'],
  '[{"title":"Enhancement of learning and memory by elevating brain magnesium","journal":"Neuron","year":2010,"url":"https://pubmed.ncbi.nlm.nih.gov/20152121"}]'::jsonb),

-- ── Skin & Anti-aging ──────────────────────────────────────────────────────
('collagen-peptides', 'Collagen Peptides (Type I & III)', 'protein',
  'Hydrolyzed collagen amino acids supporting skin elasticity and joints.',
  array['Skin elasticity and hydration','Joint health','Hair and nails'],
  array['skin','longevity'],
  10000, 20000, 'mg', 'flexible',
  array['None significant'],
  array['Allergy to source (bovine/marine)'],
  '[{"title":"Oral supplementation of specific collagen peptides has beneficial effects on human skin physiology","journal":"Skin Pharmacology and Physiology","year":2014,"url":"https://pubmed.ncbi.nlm.nih.gov/23949208"}]'::jsonb),

('nmn', 'NMN (Nicotinamide Mononucleotide)', 'longevity',
  'NAD+ precursor; supports mitochondrial function and cellular energy.',
  array['Raises NAD+ levels','Mitochondrial function','Vascular health'],
  array['skin','longevity','energy'],
  250, 1000, 'mg', 'morning',
  array['Cancer therapies (consult oncologist)'],
  array['Active malignancy'],
  '[{"title":"Long-term administration of nicotinamide mononucleotide mitigates age-associated physiological decline in mice","journal":"Cell Metabolism","year":2016,"url":"https://pubmed.ncbi.nlm.nih.gov/27818143"}]'::jsonb),

('resveratrol', 'Resveratrol (Trans-)', 'plant_compound',
  'Polyphenol from grapes that activates sirtuins and supports vascular health.',
  array['Activates SIRT1','Cardiovascular support','Synergistic with NMN'],
  array['skin','longevity'],
  250, 500, 'mg', 'with_food',
  array['Anticoagulants','CYP3A4 substrates'],
  array['Hormone-sensitive cancers'],
  '[{"title":"Resveratrol improves health and survival of mice on a high-calorie diet","journal":"Nature","year":2006,"url":"https://pubmed.ncbi.nlm.nih.gov/17086191"}]'::jsonb),

('astaxanthin', 'Astaxanthin', 'antioxidant',
  'Powerful carotenoid antioxidant that protects skin from UV damage.',
  array['UV photoprotection','Reduces wrinkles','Eye health'],
  array['skin','longevity'],
  6, 12, 'mg', 'with_food',
  array['Anticoagulants'],
  array['None significant'],
  '[{"title":"Cosmetic benefits of astaxanthin on humans subjects","journal":"Acta Biochimica Polonica","year":2012,"url":"https://pubmed.ncbi.nlm.nih.gov/22428137"}]'::jsonb),

('hyaluronic-acid', 'Hyaluronic Acid', 'protein',
  'Skin matrix component that binds water and improves hydration.',
  array['Skin hydration','Joint lubrication','Reduces wrinkle depth'],
  array['skin'],
  120, 240, 'mg', 'flexible',
  array['None significant'],
  array['None significant'],
  '[{"title":"Oral hyaluronan relieves wrinkles and improves dry skin","journal":"Nutrition Journal","year":2014,"url":"https://pubmed.ncbi.nlm.nih.gov/25014997"}]'::jsonb),

('vitamin-c', 'Vitamin C (Ascorbic Acid)', 'vitamin',
  'Essential cofactor for collagen synthesis and a primary aqueous antioxidant.',
  array['Collagen synthesis','Immune support','Skin brightness'],
  array['skin','longevity'],
  500, 1000, 'mg', 'with_food',
  array['Iron (enhances absorption)','Chemotherapy (consult)'],
  array['Kidney stones (history)'],
  '[{"title":"The roles of vitamin C in skin health","journal":"Nutrients","year":2017,"url":"https://pubmed.ncbi.nlm.nih.gov/28805671"}]'::jsonb),

('vitamin-e', 'Vitamin E (Mixed Tocopherols)', 'vitamin',
  'Lipid-soluble antioxidant protecting cell membranes.',
  array['Skin protection','Antioxidant','Cardiovascular support'],
  array['skin','longevity'],
  100, 400, 'IU', 'with_food',
  array['Anticoagulants','Statins'],
  array['Bleeding disorders','Pre-surgery'],
  '[{"title":"Vitamin E in human skin","journal":"Annals of the New York Academy of Sciences","year":2004,"url":"https://pubmed.ncbi.nlm.nih.gov/15753146"}]'::jsonb),

('coq10', 'Coenzyme Q10 (Ubiquinol)', 'antioxidant',
  'Mitochondrial electron-chain coenzyme; depletes with age and on statins.',
  array['Mitochondrial energy','Heart health','Skin elasticity'],
  array['skin','longevity','energy'],
  100, 300, 'mg', 'with_food',
  array['Warfarin','Antihypertensives'],
  array['None significant'],
  '[{"title":"Coenzyme Q10 supplementation in aging and disease","journal":"Frontiers in Physiology","year":2018,"url":"https://pubmed.ncbi.nlm.nih.gov/29459830"}]'::jsonb),

('glutathione', 'Liposomal Glutathione', 'antioxidant',
  'Master endogenous antioxidant; liposomal form survives digestion.',
  array['Detoxification','Skin brightness','Redox balance'],
  array['skin','longevity'],
  250, 500, 'mg', 'empty_stomach',
  array['Chemotherapy (consult)'],
  array['Active cancer treatment'],
  '[{"title":"Liposomal glutathione raises blood glutathione status: a randomized trial","journal":"European Journal of Nutrition","year":2018,"url":"https://pubmed.ncbi.nlm.nih.gov/?term=liposomal+glutathione+RCT"}]'::jsonb),

('niacinamide', 'Niacinamide (Vitamin B3)', 'vitamin',
  'Form of B3 supporting NAD+ pool, skin barrier, and pigmentation balance.',
  array['Improves skin barrier','Reduces hyperpigmentation','NAD+ precursor'],
  array['skin','longevity'],
  500, 1000, 'mg', 'with_food',
  array['Statins (high doses)','Diabetes medications'],
  array['Liver disease (high doses)'],
  '[{"title":"Niacinamide: a B vitamin that improves aging facial skin appearance","journal":"Dermatologic Surgery","year":2005,"url":"https://pubmed.ncbi.nlm.nih.gov/16029679"}]'::jsonb),

('polypodium-leucotomos', 'Polypodium Leucotomos', 'plant_compound',
  'Tropical fern extract that provides oral photoprotection from UV damage.',
  array['Oral sun protection','Reduces photoaging','Antioxidant'],
  array['skin'],
  240, 480, 'mg', 'morning',
  array['None significant'],
  array['None significant'],
  '[{"title":"Oral Polypodium leucotomos extract decreases ultraviolet-induced damage","journal":"Journal of the American Academy of Dermatology","year":2004,"url":"https://pubmed.ncbi.nlm.nih.gov/15243525"}]'::jsonb),

('curcumin', 'Curcumin (with Piperine)', 'plant_compound',
  'Active turmeric polyphenol — anti-inflammatory; piperine boosts absorption ~20×.',
  array['Anti-inflammatory','Joint comfort','Skin clarity'],
  array['skin','longevity'],
  500, 1000, 'mg', 'with_food',
  array['Anticoagulants','Diabetes medications'],
  array['Gallstones','Bleeding disorders'],
  '[{"title":"Curcumin: a review of its effects on human health","journal":"Foods","year":2017,"url":"https://pubmed.ncbi.nlm.nih.gov/29065496"}]'::jsonb),

('spermidine', 'Spermidine', 'longevity',
  'Polyamine that triggers autophagy — cellular self-cleaning.',
  array['Triggers autophagy','Cardiovascular health','Cognitive support'],
  array['longevity','skin'],
  1, 6, 'mg', 'morning',
  array['Immunosuppressants'],
  array['None significant'],
  '[{"title":"Cardioprotection and lifespan extension by the natural polyamine spermidine","journal":"Nature Medicine","year":2016,"url":"https://pubmed.ncbi.nlm.nih.gov/27841876"}]'::jsonb),

('tmg', 'TMG (Trimethylglycine)', 'amino_acid',
  'Methyl donor that supports homocysteine metabolism — pairs with NMN.',
  array['Methylation support','Lowers homocysteine','Pairs with NMN'],
  array['longevity'],
  500, 1000, 'mg', 'morning',
  array['None significant'],
  array['None significant'],
  '[{"title":"Betaine in human nutrition","journal":"American Journal of Clinical Nutrition","year":2004,"url":"https://pubmed.ncbi.nlm.nih.gov/15321791"}]'::jsonb),

('alpha-lipoic-acid', 'Alpha-Lipoic Acid', 'antioxidant',
  'Universal antioxidant active in both water and lipid compartments.',
  array['Glucose regulation','Skin glycation defense','Mitochondrial support'],
  array['skin','longevity'],
  300, 600, 'mg', 'empty_stomach',
  array['Diabetes medications','Thyroid hormones'],
  array['Thiamine deficiency'],
  '[{"title":"Alpha-lipoic acid as a dietary supplement: molecular mechanisms and therapeutic potential","journal":"Biochimica et Biophysica Acta","year":2009,"url":"https://pubmed.ncbi.nlm.nih.gov/19664690"}]'::jsonb);

-- ============================================================================
-- Brands (us / eu / global) — placeholder affiliate URLs (rcode=PLACEHOLDER)
-- ============================================================================
-- Helper CTE so we can join slugs to UUIDs without hard-coding.
with sup as (
  select id, slug from public.supplements
)
insert into public.supplement_brands
  (supplement_id, brand_name, product_name, region, affiliate_url, price_usd, is_recommended)
select id,
       brand_name,
       product_name,
       region,
       affiliate_url,
       price_usd,
       is_recommended
from sup
join (values
  -- (slug, brand_name, product_name, region, affiliate_url, price_usd, is_recommended)
  ('vitamin-d3','Thorne','Vitamin D-5000','us','https://www.thorne.com/products/dp/vitamin-d-5-000?rcode=PLACEHOLDER',22,true),
  ('vitamin-d3','Solgar','Vitamin D3 5000 IU','eu','https://www.iherb.com/pr/solgar-vitamin-d3?rcode=PLACEHOLDER',18,false),
  ('vitamin-d3','NOW Foods','Vitamin D-3 5,000 IU','global','https://www.iherb.com/pr/now-foods-vitamin-d-3?rcode=PLACEHOLDER',12,false),

  ('magnesium-glycinate','Pure Encapsulations','Magnesium Glycinate','us','https://www.pureencapsulations.com/magnesium-glycinate.html?rcode=PLACEHOLDER',38,true),
  ('magnesium-glycinate','Solgar','Magnesium Bisglycinate','eu','https://www.iherb.com/pr/solgar-magnesium?rcode=PLACEHOLDER',24,false),
  ('magnesium-glycinate','Doctor''s Best','High Absorption Magnesium','global','https://www.iherb.com/pr/doctors-best-magnesium?rcode=PLACEHOLDER',22,false),

  ('zinc-picolinate','Thorne','Zinc Picolinate 30','us','https://www.thorne.com/products/dp/zinc-picolinate?rcode=PLACEHOLDER',14,true),
  ('zinc-picolinate','Solgar','Zinc Picolinate 22 mg','eu','https://www.iherb.com/pr/solgar-zinc-picolinate?rcode=PLACEHOLDER',12,false),
  ('zinc-picolinate','NOW Foods','Zinc Picolinate 50 mg','global','https://www.iherb.com/pr/now-foods-zinc-picolinate?rcode=PLACEHOLDER',9,false),

  ('boron','Pure Encapsulations','Boron','us','https://www.pureencapsulations.com/boron.html?rcode=PLACEHOLDER',16,true),
  ('boron','Now Foods','Boron 3 mg','eu','https://www.iherb.com/pr/now-foods-boron?rcode=PLACEHOLDER',10,false),
  ('boron','Bulksupplements','Boron Citrate','global','https://www.bulksupplements.com/products/boron-citrate?rcode=PLACEHOLDER',12,false),

  ('ashwagandha','Pure Encapsulations','Ashwagandha (KSM-66)','us','https://www.pureencapsulations.com/ashwagandha.html?rcode=PLACEHOLDER',32,true),
  ('ashwagandha','Solgar','Ashwagandha Root Extract','eu','https://www.iherb.com/pr/solgar-ashwagandha?rcode=PLACEHOLDER',24,false),
  ('ashwagandha','Nutricost','KSM-66 Ashwagandha','global','https://www.iherb.com/pr/nutricost-ksm-66?rcode=PLACEHOLDER',18,false),

  ('tongkat-ali','Double Wood','Tongkat Ali 200:1','us','https://doublewoodsupplements.com/products/tongkat-ali?rcode=PLACEHOLDER',32,true),
  ('tongkat-ali','Bulksupplements','Tongkat Ali Extract','eu','https://www.bulksupplements.com/products/tongkat-ali?rcode=PLACEHOLDER',28,false),
  ('tongkat-ali','Nootropics Depot','Tongkat Ali 10% Eurycomanone','global','https://nootropicsdepot.com/tongkat-ali-extract?rcode=PLACEHOLDER',45,false),

  ('fadogia-agrestis','Double Wood','Fadogia Agrestis 600 mg','us','https://doublewoodsupplements.com/products/fadogia-agrestis?rcode=PLACEHOLDER',30,true),
  ('fadogia-agrestis','Nootropics Depot','Fadogia Agrestis 10:1','eu','https://nootropicsdepot.com/fadogia-agrestis?rcode=PLACEHOLDER',35,false),
  ('fadogia-agrestis','Bulksupplements','Fadogia Agrestis Extract','global','https://www.bulksupplements.com/products/fadogia-agrestis?rcode=PLACEHOLDER',26,false),

  ('creatine-monohydrate','Thorne','Creatine','us','https://www.thorne.com/products/dp/creatine?rcode=PLACEHOLDER',45,true),
  ('creatine-monohydrate','MyProtein','Creapure Creatine','eu','https://www.myprotein.com/creapure-creatine?rcode=PLACEHOLDER',22,false),
  ('creatine-monohydrate','Bulksupplements','Creatine Monohydrate','global','https://www.bulksupplements.com/products/creatine-monohydrate?rcode=PLACEHOLDER',20,false),

  ('omega-3-epa-dha','Thorne','Super EPA','us','https://www.thorne.com/products/dp/super-epa?rcode=PLACEHOLDER',42,true),
  ('omega-3-epa-dha','Solgar','Omega-3 950 mg','eu','https://www.iherb.com/pr/solgar-omega-3?rcode=PLACEHOLDER',32,false),
  ('omega-3-epa-dha','Nordic Naturals','Ultimate Omega','global','https://www.iherb.com/pr/nordic-naturals-ultimate-omega?rcode=PLACEHOLDER',38,false),

  ('tribulus-terrestris','Now Foods','Tribulus 1000 mg','us','https://www.iherb.com/pr/now-foods-tribulus?rcode=PLACEHOLDER',16,true),
  ('tribulus-terrestris','Solgar','Tribulus Standardized','eu','https://www.iherb.com/pr/solgar-tribulus?rcode=PLACEHOLDER',22,false),
  ('tribulus-terrestris','Bulksupplements','Tribulus Extract','global','https://www.bulksupplements.com/products/tribulus?rcode=PLACEHOLDER',14,false),

  ('maca-root','Gaia Herbs','Maca Root','us','https://www.iherb.com/pr/gaia-herbs-maca-root?rcode=PLACEHOLDER',24,true),
  ('maca-root','Solgar','Maca 525 mg','eu','https://www.iherb.com/pr/solgar-maca?rcode=PLACEHOLDER',20,false),
  ('maca-root','Anthony''s','Organic Maca Powder','global','https://www.iherb.com/pr/anthonys-maca?rcode=PLACEHOLDER',16,false),

  ('l-carnitine','Doctor''s Best','L-Carnitine Tartrate','us','https://www.iherb.com/pr/doctors-best-l-carnitine?rcode=PLACEHOLDER',22,true),
  ('l-carnitine','Solgar','L-Carnitine 500 mg','eu','https://www.iherb.com/pr/solgar-l-carnitine?rcode=PLACEHOLDER',24,false),
  ('l-carnitine','Now Foods','L-Carnitine 1000 mg','global','https://www.iherb.com/pr/now-foods-l-carnitine?rcode=PLACEHOLDER',18,false),

  ('vitamin-k2-mk7','Thorne','Vitamin K2','us','https://www.thorne.com/products/dp/vitamin-k2?rcode=PLACEHOLDER',32,true),
  ('vitamin-k2-mk7','Solgar','Vitamin K2 (MK-7)','eu','https://www.iherb.com/pr/solgar-vitamin-k2?rcode=PLACEHOLDER',26,false),
  ('vitamin-k2-mk7','Now Foods','MK-7 100 mcg','global','https://www.iherb.com/pr/now-foods-mk-7?rcode=PLACEHOLDER',14,false),

  ('selenium','Pure Encapsulations','Selenium (Selenomethionine)','us','https://www.pureencapsulations.com/selenium.html?rcode=PLACEHOLDER',18,true),
  ('selenium','Solgar','Selenium 200 mcg','eu','https://www.iherb.com/pr/solgar-selenium?rcode=PLACEHOLDER',12,false),
  ('selenium','Now Foods','Selenium 200 mcg','global','https://www.iherb.com/pr/now-foods-selenium?rcode=PLACEHOLDER',10,false),

  ('b-complex','Thorne','Basic B Complex','us','https://www.thorne.com/products/dp/basic-b-complex?rcode=PLACEHOLDER',24,true),
  ('b-complex','Solgar','B-Complex "100"','eu','https://www.iherb.com/pr/solgar-b-complex?rcode=PLACEHOLDER',22,false),
  ('b-complex','Jarrow Formulas','B-Right','global','https://www.iherb.com/pr/jarrow-b-right?rcode=PLACEHOLDER',16,false),

  ('l-theanine','Suntheanine','L-Theanine 200 mg','us','https://www.iherb.com/pr/now-foods-l-theanine?rcode=PLACEHOLDER',18,true),
  ('l-theanine','Solgar','L-Theanine 150 mg','eu','https://www.iherb.com/pr/solgar-l-theanine?rcode=PLACEHOLDER',22,false),
  ('l-theanine','Now Foods','L-Theanine 200 mg','global','https://www.iherb.com/pr/now-foods-l-theanine-200?rcode=PLACEHOLDER',14,false),

  ('glycine','Bulksupplements','Glycine Powder','us','https://www.bulksupplements.com/products/glycine?rcode=PLACEHOLDER',18,true),
  ('glycine','Now Foods','Glycine 1000 mg','eu','https://www.iherb.com/pr/now-foods-glycine?rcode=PLACEHOLDER',12,false),
  ('glycine','Anthony''s','Glycine Powder','global','https://www.iherb.com/pr/anthonys-glycine?rcode=PLACEHOLDER',16,false),

  ('apigenin','Double Wood','Apigenin 50 mg','us','https://doublewoodsupplements.com/products/apigenin?rcode=PLACEHOLDER',26,true),
  ('apigenin','Nootropics Depot','Apigenin Capsules','eu','https://nootropicsdepot.com/apigenin-capsules?rcode=PLACEHOLDER',32,false),
  ('apigenin','Bulksupplements','Apigenin Powder','global','https://www.bulksupplements.com/products/apigenin?rcode=PLACEHOLDER',28,false),

  ('melatonin','Pure Encapsulations','Melatonin 0.5 mg','us','https://www.pureencapsulations.com/melatonin-0-5-mg.html?rcode=PLACEHOLDER',14,true),
  ('melatonin','Solgar','Melatonin 1 mg','eu','https://www.iherb.com/pr/solgar-melatonin?rcode=PLACEHOLDER',12,false),
  ('melatonin','Now Foods','Melatonin 0.5 mg','global','https://www.iherb.com/pr/now-foods-melatonin?rcode=PLACEHOLDER',8,false),

  ('gaba','Now Foods','GABA 750 mg','us','https://www.iherb.com/pr/now-foods-gaba?rcode=PLACEHOLDER',16,true),
  ('gaba','Solgar','GABA 500 mg','eu','https://www.iherb.com/pr/solgar-gaba?rcode=PLACEHOLDER',18,false),
  ('gaba','Doctor''s Best','GABA with PharmaGABA','global','https://www.iherb.com/pr/doctors-best-gaba?rcode=PLACEHOLDER',14,false),

  ('5-htp','Now Foods','5-HTP 100 mg','us','https://www.iherb.com/pr/now-foods-5-htp?rcode=PLACEHOLDER',16,true),
  ('5-htp','Solgar','5-HTP 100 mg','eu','https://www.iherb.com/pr/solgar-5-htp?rcode=PLACEHOLDER',22,false),
  ('5-htp','Natrol','5-HTP 100 mg','global','https://www.iherb.com/pr/natrol-5-htp?rcode=PLACEHOLDER',14,false),

  ('tart-cherry-extract','Cherry Bay Orchards','Montmorency Tart Cherry','us','https://www.iherb.com/pr/cherry-bay-orchards?rcode=PLACEHOLDER',22,true),
  ('tart-cherry-extract','Solaray','Tart Cherry Extract','eu','https://www.iherb.com/pr/solaray-tart-cherry?rcode=PLACEHOLDER',24,false),
  ('tart-cherry-extract','Now Foods','Tart Cherry 1200 mg','global','https://www.iherb.com/pr/now-foods-tart-cherry?rcode=PLACEHOLDER',18,false),

  ('reishi-mushroom','Real Mushrooms','Reishi Extract','us','https://www.iherb.com/pr/real-mushrooms-reishi?rcode=PLACEHOLDER',32,true),
  ('reishi-mushroom','Now Foods','Reishi 270 mg','eu','https://www.iherb.com/pr/now-foods-reishi?rcode=PLACEHOLDER',20,false),
  ('reishi-mushroom','Host Defense','Reishi Capsules','global','https://www.iherb.com/pr/host-defense-reishi?rcode=PLACEHOLDER',28,false),

  ('lavender-extract','Pure Encapsulations','Lavender (Silexan)','us','https://www.pureencapsulations.com/lavender.html?rcode=PLACEHOLDER',28,true),
  ('lavender-extract','Schwabe','Lasea (Silexan)','eu','https://www.iherb.com/pr/schwabe-lasea?rcode=PLACEHOLDER',32,false),
  ('lavender-extract','Now Foods','Lavender Oil Capsules','global','https://www.iherb.com/pr/now-foods-lavender?rcode=PLACEHOLDER',16,false),

  ('magnesium-l-threonate','Magtein','Magnesium L-Threonate','us','https://www.iherb.com/pr/magtein?rcode=PLACEHOLDER',40,true),
  ('magnesium-l-threonate','Double Wood','Magnesium L-Threonate','eu','https://doublewoodsupplements.com/products/magnesium-l-threonate?rcode=PLACEHOLDER',36,false),
  ('magnesium-l-threonate','Now Foods','Magtein Magnesium L-Threonate','global','https://www.iherb.com/pr/now-foods-magtein?rcode=PLACEHOLDER',32,false),

  ('collagen-peptides','Vital Proteins','Collagen Peptides','us','https://www.iherb.com/pr/vital-proteins-collagen-peptides?rcode=PLACEHOLDER',32,true),
  ('collagen-peptides','Solgar','Collagen Hyaluronic Acid','eu','https://www.iherb.com/pr/solgar-collagen?rcode=PLACEHOLDER',38,false),
  ('collagen-peptides','Sports Research','Collagen Peptides','global','https://www.iherb.com/pr/sports-research-collagen?rcode=PLACEHOLDER',28,false),

  ('nmn','Renue By Science','Pure NMN Powder','us','https://renuebyscience.com/products/nmn-powder?rcode=PLACEHOLDER',55,true),
  ('nmn','Double Wood','NMN 250 mg','eu','https://doublewoodsupplements.com/products/nmn?rcode=PLACEHOLDER',45,false),
  ('nmn','Bulksupplements','NMN Powder','global','https://www.bulksupplements.com/products/nmn?rcode=PLACEHOLDER',38,false),

  ('resveratrol','Thorne','Resveracel','us','https://www.thorne.com/products/dp/resveracel?rcode=PLACEHOLDER',58,true),
  ('resveratrol','Now Foods','Resveratrol 200 mg','eu','https://www.iherb.com/pr/now-foods-resveratrol?rcode=PLACEHOLDER',24,false),
  ('resveratrol','Doctor''s Best','Trans-Resveratrol','global','https://www.iherb.com/pr/doctors-best-resveratrol?rcode=PLACEHOLDER',26,false),

  ('astaxanthin','Sports Research','Astaxanthin 12 mg','us','https://www.iherb.com/pr/sports-research-astaxanthin?rcode=PLACEHOLDER',26,true),
  ('astaxanthin','Solgar','Astaxanthin 5 mg','eu','https://www.iherb.com/pr/solgar-astaxanthin?rcode=PLACEHOLDER',32,false),
  ('astaxanthin','Now Foods','Astaxanthin 4 mg','global','https://www.iherb.com/pr/now-foods-astaxanthin?rcode=PLACEHOLDER',18,false),

  ('hyaluronic-acid','Doctor''s Best','Hyaluronic Acid','us','https://www.iherb.com/pr/doctors-best-hyaluronic-acid?rcode=PLACEHOLDER',22,true),
  ('hyaluronic-acid','Solgar','Hyaluronic Acid 120 mg','eu','https://www.iherb.com/pr/solgar-hyaluronic-acid?rcode=PLACEHOLDER',28,false),
  ('hyaluronic-acid','Now Foods','Hyaluronic Acid 100 mg','global','https://www.iherb.com/pr/now-foods-hyaluronic-acid?rcode=PLACEHOLDER',18,false),

  ('vitamin-c','Thorne','Vitamin C with Flavonoids','us','https://www.thorne.com/products/dp/vitamin-c-with-flavonoids?rcode=PLACEHOLDER',24,true),
  ('vitamin-c','Solgar','Vitamin C 1000 mg','eu','https://www.iherb.com/pr/solgar-vitamin-c?rcode=PLACEHOLDER',20,false),
  ('vitamin-c','Now Foods','Vitamin C-1000 with Bioflavonoids','global','https://www.iherb.com/pr/now-foods-vitamin-c?rcode=PLACEHOLDER',14,false),

  ('vitamin-e','Pure Encapsulations','Vitamin E (Mixed Tocopherols)','us','https://www.pureencapsulations.com/vitamin-e.html?rcode=PLACEHOLDER',26,true),
  ('vitamin-e','Solgar','Vitamin E 400 IU','eu','https://www.iherb.com/pr/solgar-vitamin-e?rcode=PLACEHOLDER',22,false),
  ('vitamin-e','Now Foods','E-400 with Mixed Tocopherols','global','https://www.iherb.com/pr/now-foods-vitamin-e?rcode=PLACEHOLDER',16,false),

  ('coq10','Qunol','Ubiquinol 100 mg','us','https://www.iherb.com/pr/qunol-ubiquinol?rcode=PLACEHOLDER',38,true),
  ('coq10','Solgar','CoQ-10 100 mg','eu','https://www.iherb.com/pr/solgar-coq10?rcode=PLACEHOLDER',32,false),
  ('coq10','Doctor''s Best','High Absorption CoQ10','global','https://www.iherb.com/pr/doctors-best-coq10?rcode=PLACEHOLDER',22,false),

  ('glutathione','Quicksilver Scientific','Liposomal Glutathione','us','https://quicksilverscientific.com/liposomal-glutathione?rcode=PLACEHOLDER',55,true),
  ('glutathione','Solgar','Reduced L-Glutathione','eu','https://www.iherb.com/pr/solgar-glutathione?rcode=PLACEHOLDER',32,false),
  ('glutathione','Now Foods','L-Glutathione 500 mg','global','https://www.iherb.com/pr/now-foods-glutathione?rcode=PLACEHOLDER',26,false),

  ('niacinamide','Thorne','Niacinamide','us','https://www.thorne.com/products/dp/niacinamide?rcode=PLACEHOLDER',18,true),
  ('niacinamide','Solgar','Niacinamide 500 mg','eu','https://www.iherb.com/pr/solgar-niacinamide?rcode=PLACEHOLDER',16,false),
  ('niacinamide','Now Foods','Niacinamide 500 mg','global','https://www.iherb.com/pr/now-foods-niacinamide?rcode=PLACEHOLDER',12,false),

  ('polypodium-leucotomos','Heliocare','Heliocare Capsules','us','https://www.iherb.com/pr/heliocare?rcode=PLACEHOLDER',38,true),
  ('polypodium-leucotomos','Heliocare','Heliocare Ultra','eu','https://www.iherb.com/pr/heliocare-ultra?rcode=PLACEHOLDER',42,false),
  ('polypodium-leucotomos','Sundots','Polypodium Capsules','global','https://www.iherb.com/pr/sundots?rcode=PLACEHOLDER',32,false),

  ('curcumin','Thorne','Meriva Curcumin','us','https://www.thorne.com/products/dp/meriva-sf?rcode=PLACEHOLDER',36,true),
  ('curcumin','Solgar','Full Spectrum Curcumin','eu','https://www.iherb.com/pr/solgar-curcumin?rcode=PLACEHOLDER',32,false),
  ('curcumin','Doctor''s Best','Curcumin with BioPerine','global','https://www.iherb.com/pr/doctors-best-curcumin?rcode=PLACEHOLDER',22,false),

  ('spermidine','Spermidine Life','Original 365+','us','https://spermidinelife.us/?rcode=PLACEHOLDER',75,true),
  ('spermidine','Double Wood','Spermidine Wheat Germ','eu','https://doublewoodsupplements.com/products/spermidine?rcode=PLACEHOLDER',45,false),
  ('spermidine','Primeadine','Primeadine Original','global','https://oxfordhealthspan.com/products/primeadine?rcode=PLACEHOLDER',65,false),

  ('tmg','Now Foods','TMG 1000 mg','us','https://www.iherb.com/pr/now-foods-tmg?rcode=PLACEHOLDER',16,true),
  ('tmg','Double Wood','TMG 1000 mg','eu','https://doublewoodsupplements.com/products/tmg?rcode=PLACEHOLDER',22,false),
  ('tmg','Bulksupplements','TMG Powder','global','https://www.bulksupplements.com/products/tmg?rcode=PLACEHOLDER',18,false),

  ('alpha-lipoic-acid','Doctor''s Best','Alpha Lipoic Acid 600 mg','us','https://www.iherb.com/pr/doctors-best-ala?rcode=PLACEHOLDER',24,true),
  ('alpha-lipoic-acid','Solgar','Alpha Lipoic Acid 600 mg','eu','https://www.iherb.com/pr/solgar-ala?rcode=PLACEHOLDER',28,false),
  ('alpha-lipoic-acid','Now Foods','Alpha Lipoic Acid 250 mg','global','https://www.iherb.com/pr/now-foods-ala?rcode=PLACEHOLDER',16,false)
) as v(slug, brand_name, product_name, region, affiliate_url, price_usd, is_recommended)
on sup.slug = v.slug;

commit;

-- ============================================================================
-- How to apply this seed
-- ============================================================================
-- 1. Open https://app.supabase.com → your project → SQL Editor → New query.
-- 2. Paste this entire file and click "Run".
-- 3. Verify: select count(*) from public.supplements;          -- expect 40
--           select count(*) from public.supplement_brands;    -- expect 120
-- ============================================================================
