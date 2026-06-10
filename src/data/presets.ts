export interface NicheInfo {
  id: string;
  name: string;
  emoji: string;
  triggers: string[];
  avoidDescription: string;
  tagline: string;
}

export const YOUTUBE_NICHES: NicheInfo[] = [
  {
    id: "finance_investing",
    name: "Finance & Investing",
    emoji: "💵",
    triggers: ["mistake", "exposed", "passive income", "nobody tells you", "$X in Y days", "most people don't know"],
    avoidDescription: "Avoid guarantee returns, easy quick money, get rich quick tags (algorithm flags as scam-adjacent)",
    tagline: "Wealth strategy, financial advice, market analysis"
  },
  {
    id: "gaming",
    name: "Gaming",
    emoji: "🎮",
    triggers: ["OP", "broken", "secret strat", "nobody uses this", "rank up fast", "developers don't want you to know"],
    avoidDescription: "Avoid generic 'tutorial' tags; replace with high-excitement gaming updates",
    tagline: "Let's plays, speedruns, game breakdowns and strategies"
  },
  {
    id: "tech_gadgets",
    name: "Tech & Gadgets",
    emoji: "💻",
    triggers: ["honest review", "don't buy until", "finally released", "kills the competition", "worth it in 2026"],
    avoidDescription: "Avoid oversaturated generic statements like 'unboxing' or 'best ever'",
    tagline: "Product deep dives, industry rumors, hardware benchmarks"
  },
  {
    id: "fitness_health",
    name: "Fitness & Health",
    emoji: "💪",
    triggers: ["stopped doing this", "science says", "actually works", "nobody tells you", "ruins your progress"],
    avoidDescription: "Avoid extreme over-promises like overnight results, easy physical transformation",
    tagline: "Workout guides, nutritional science, healthy habit tracking"
  },
  {
    id: "cooking_food",
    name: "Cooking & Food",
    emoji: "🍳",
    triggers: ["never again", "game changer", "secret ingredient", "better than restaurant", "I was wrong about"],
    avoidDescription: "Avoid highly saturated titles like 'simple recipe' or 'quick and easy'",
    tagline: "Recipe walk-throughs, kitchen equipment tips, culinary challenges"
  },
  {
    id: "education",
    name: "Education",
    emoji: "🎓",
    triggers: ["actually understand", "myth completely busted", "surprising truth about", "finally explained"],
    avoidDescription: "Avoid slow, traditional labels like 'full course' or 'complete guide' which lower urgency",
    tagline: "Deep explanations, historical mysteries, scientific proof"
  },
  {
    id: "beauty_skincare",
    name: "Beauty & Skincare",
    emoji: "✨",
    triggers: ["worst mistake", "actually works", "dermatologist says", "dupe for $200 product"],
    avoidDescription: "Avoid zero-specificity clichés like 'amazing' or 'obsessed with'",
    tagline: "Makeup styles, cosmetic science, product budget optimization"
  },
  {
    id: "youtube_growth",
    name: "YouTube Growth",
    emoji: "📈",
    triggers: ["algorithm", "dead channel", "CTR dropped", "nobody shows you this", "views stopped overnight"],
    avoidDescription: "Avoid spammy taglines such as 'grow fast' or 'easy millions'",
    tagline: "Audience analytics, visual CTR experiments, retention secrets"
  },
  {
    id: "lifestyle_travel",
    name: "Lifestyle & Travel",
    emoji: "✈️",
    triggers: ["uncomfortable truth", "what they won't show you", "never go here", "biggest travel mistake", "how I afford to travel"],
    avoidDescription: "Avoid simple diary entries like 'Travel vlog #4' or basic city guides",
    tagline: "Digital nomad guides, daily habits, immersive travel perspectives"
  },
  {
    id: "business_entrepreneurship",
    name: "Business & Entrepreneurship",
    emoji: "💼",
    triggers: ["side hustle", "business model exposed", "how I failed", "don't start a business until", "unpopular business truth"],
    avoidDescription: "Avoid hollow motivational talk without structured data, get-rich schemes",
    tagline: "Startup failures, operational logs, income pipelines"
  },
  {
    id: "science_tech",
    name: "Science & Tech",
    emoji: "🔬",
    triggers: ["we were wrong", "the science of", "this changes everything", "insane discovery", "what happened when"],
    avoidDescription: "Avoid complex academic headlines; simplify to hook general curiosities",
    tagline: "Space exploration, software architecture, futuristic inventions"
  },
  {
    id: "creative_design",
    name: "Creative & Design",
    emoji: "🎨",
    triggers: ["game changing hack", "amateur vs pro", "stop designing like this", "hidden tools", "the design secret behind"],
    avoidDescription: "Avoid simple descriptions of design steps without active hooks",
    tagline: "Web UI breakdowns, 3D asset workflows, visual composition"
  }
];

export const CONTENT_FORMATS = [
  "Tutorial / Walkthrough",
  "Review / Criticism",
  "YouTube Shorts Mini-Hook",
  "Listicle (e.g., Top 5)",
  "Vlog / Immersive Log",
  "Deep Dive / Video Essay",
  "Q&A / Challenge Response"
];

export const TARGET_AUDIENCES = [
  "Beginners",
  "Advanced & Professionals",
  "Aspiring Creators",
  "Skeptics & Analysts",
  "Casual Observers",
  "Passionate Enthusiasts",
  "Aspirational Seekers"
];

export const CONTENT_TONES = [
  { name: "Conversational", desc: "Friendly, casual, easy to listen to" },
  { name: "Highly Professional", desc: "Expert authority, highly trustworthy" },
  { name: "Hype / High-Energy", desc: "Fast-tempo excitement with powerful verbs" },
  { name: "Contrarian", desc: "Challenging expectations, debunking ideas" },
  { name: "Educational", desc: "Fact-based, explaining the core 'why'" },
  { name: "Inspiring", desc: "Aspirational stories focusing on potential" },
  { name: "Provocative / Daring", desc: "Stating bold assumptions, opening mystery loops" }
];

export const CHANNEL_MATURITIES = [
  { id: "new", name: "New channel", desc: "Avoid false absolute-authority traps; rely on curiosity gaps" },
  { id: "growing", name: "Growing channel", desc: "Balanced authority; utilize case studies and specific data" },
  { id: "established", name: "Established authority", desc: "Leverage personal brand, community recognition, and expertise status" }
];

export const LOADING_STAGES = [
  "Analyzing video idea framework...",
  "Cross-checking niche high-CTR vocabulary libraries...",
  "Structuring SEO terms inside first 35 characters...",
  "Calibrating feed curiosity gap indicators...",
  "Evaluating algorithm retention safety risk ratings...",
  "Compiling dual-track optimized title sets..."
];
