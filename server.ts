import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// System prompt logic defining the 12 niches, high-CTR vocabularies, formats, audit rules, etc.
const SYSTEM_INSTRUCTION = `
You are YTGEN, an elite YouTube SEO strategist, audience behavior psychologist, and algorithm safety auditor. Your job is to generate exactly 10 highly optimized YouTube video titles split into two parallel tracks (5 titles per track) based on the user's inputs. 

Here are the 12 niches and their High-CTR Trigger Vocabulary and Avoid Lists:
1. Finance & Investing: Triggers: ["mistake", "exposed", "passive income", "nobody tells you", "$X in Y days", "most people don't know"]. Avoid: ["guaranteed returns", "easy money", "get rich"].
2. Gaming: Triggers: ["OP", "broken", "secret strat", "nobody uses this", "rank up fast", "developers don't want you to know"]. Avoid: ["tutorial", "beginners guide" (unless beginner format)].
3. Tech & Gadgets: Triggers: ["honest review", "don't buy until", "finally released", "kills the competition", "worth it in 2026"]. Avoid: ["unboxing", "best ever"].
4. Fitness & Health: Triggers: ["stopped doing this", "science says", "actually works", "nobody tells you", "ruins your progress"]. Avoid: ["easy", "fast results", "overnight transformation"].
5. Cooking & Food: Triggers: ["never again", "game changer", "secret ingredient", "better than restaurant", "I was wrong about"]. Avoid: ["simple recipe", "quick and easy"].
6. Education: Triggers: ["actually understand", "myth completely busted", "surprising truth about", "finally explained"]. Avoid: ["full course", "complete guide"].
7. Beauty & Skincare: Triggers: ["worst mistake", "actually works", "dermatologist says", "dupe for $200 product"]. Avoid: ["amazing", "obsessed with"].
8. YouTube Growth: Triggers: ["algorithm", "dead channel", "CTR dropped", "nobody shows you this", "views stopped overnight"]. Avoid: ["grow fast", "easy views"].
9. Lifestyle & Travel: Triggers: ["uncomfortable truth", "what they won't show you", "never go here", "biggest travel mistake", "how I afford to travel"]. Avoid: ["beautiful vlogs", "best travel guide"].
10. Business & Entrepreneurship: Triggers: ["side hustle", "business model exposed", "how I failed", "don't start a business until", "unpopular business truth"]. Avoid: ["get rich quick", "secrets to success"].
11. Science & Tech: Triggers: ["we were wrong", "the science of", "this changes everything", "insane discovery", "what happened when"]. Avoid: ["introduction to physics", "simple science"].
12. Creative & Design: Triggers: ["game changing hack", "amateur vs pro", "stop designing like this", "hidden tools", "the design secret behind"]. Avoid: ["easy draw", "beginner tutorial"].

DUAL-TRACK STRUCTURAL RULES:

TRACK A (SEO Keyword-Optimized - Search intent first):
- Goal: Win in YouTube Search.
- Front-loading constraint: The primary target keyword (or key subject verb/noun phrase if user entered no keywords) MUST start within the first 35 characters. This prevents mobile search truncation.
- Natural language flow: Must be a coherent readable sentence, not visual tag salad.
- Character Limit: Hard Max of 65 characters per title.
- Structure: Clear, authoritative query answers. No double keywords.

TRACK B (Audience Need Coverage - Feed & recommendation psychology):
- Goal: Win page-clicks in Homepage and Suggested feeds where viewers act on psychological triggers.
- Curiosity Gap: Create high interest using information gaps (tension between what viewer knows and wants to know).
- Voice Selection: Apply selected Tone and match to Niche Vocabulary signals.
- Character Limit: Hard Max of 65 characters per title.
- Priority: Human trigger vocabulary, curiosity tension, and authentic framing.

PER-TITLE AUTOMATED SCORING METRICS:
Each title must be mapped to:
1. SEO Score: 0 to 100 based on keyword usage, front-loading, search potential, and natural flow.
2. Curiosity Gap Score: 0 to 100 based on how well it stimulates curiosity loops without being empty clickbait.
3. Algorithm Safety:
   - SAFE: Curiosity without over-promising or false claims. Watch time likely stable.
   - CAUTION: Has specific reviewable counts or content promises. The viewer will check (e.g. "5 mistakes").
   - DANGER: Guarantees quick transformations, extreme returns, or impossible timeframes. Extreme retention drop-off risk. Recommend avoid.
4. why: Explains the specific psychological and semantic mechanism driving this title (referencing the niche/audience directly, not a generic catch-all).
5. front_loaded: true if critical search queries/words reside in the first 35 characters.
6. framework: Specify which of these patterns is used: FOMO, Listicle, Transformation, Contrarian, Authority Reveal, Curiosity Gap, Question Hook, Data-Driven, Shock Value, or How-To.

UNIQUENESS ENFORCEMENT:
- All 10 generated titles must present custom phrasing, distinct frameworks, and starting words. Do not repeat titles or change only one word! Make each feel like a completely different pitch.
`;

// Helper function to handle transient 503 high demand or unavailable errors with backoff & model fallback
async function generateContentWithRetry(parameters: any, retriesLeft = 3, delayMs = 1000): Promise<any> {
  try {
    return await ai.models.generateContent(parameters);
  } catch (error: any) {
    console.warn(`Gemini API error during generation attempt (retries left: ${retriesLeft}):`, error);
    
    // Check if the error indicates a transient issue (like 503 Service Unavailable, RESOURCE_EXHAUSTED, or overloaded)
    const errorStr = (error?.message || "").toLowerCase() + " " + JSON.stringify(error).toLowerCase();
    const isTransient = error?.status === "UNAVAILABLE" || 
                        error?.status === 503 || 
                        errorStr.includes("503") || 
                        errorStr.includes("unavailable") ||
                        errorStr.includes("high demand") ||
                        errorStr.includes("resource exhausted") ||
                        errorStr.includes("spike");

    if (isTransient && retriesLeft > 0) {
      console.log(`Waiting ${delayMs}ms before retrying ...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return generateContentWithRetry(parameters, retriesLeft - 1, delayMs * 2);
    }
    
    // If 503 issues persist on the default model, try to swap to a lighter fallback model
    if (parameters.model === "gemini-3.5-flash") {
      console.log("Switching fallback model to gemini-3.1-flash-lite due to 503/transient errors with gemini-3.5-flash");
      const fallbackParams = {
        ...parameters,
        model: "gemini-3.1-flash-lite"
      };
      // Try gemini-3.1-flash-lite with 2 retries
      return generateContentWithRetry(fallbackParams, 2, 1000);
    }

    throw error;
  }
}

// Helper endpoint for validation
app.post("/api/generate-titles", async (req, res) => {
  try {
    const { videoIdea, keywords, majorCategory, customNiche, niche, format, audience, tone, maturity } = req.body;

    if (!videoIdea) {
      return res.status(400).json({ error: "Video Idea is required" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
    }

    // Perform robust dynamic analysis on keywords and the video concept to auto-detect both category and niche
    const activeCategory = majorCategory || "Auto Detect via AI";
    const activeCustomNiche = customNiche || "";

    // construct dynamic user prompt
    const userPromptText = `
User Input for YouTube Title Generation:
- Video Idea / Concept: "${videoIdea}"
- Keywords Supplied: [${(keywords || []).map((k: string) => `"${k}"`).join(", ")}]
- Input Category Hint: "${activeCategory}"
- Input Custom Niche Hint: "${activeCustomNiche}"
- Content Format: "${format || "Standard"}"
- Target Audience: [${(audience || []).map((a: string) => `"${a}"`).join(", ")}]
- Tone: "${tone || "Conversational"}"
- Channel Maturity: "${maturity || "New channel"}"

INTELLIGENT AUTO-DETECTION MANDATE (CRITICAL):
Analyze the entered keywords and the primary Video Idea / Concept to dynamically determine the most fitting 2-level niche architecture:
1. Major Category: Select a broad content category (e.g. Business & Finance, Technology, Health & Fitness, Creative & Design, Education, Lifestyle, Entertainment, Food & Cooking, Travel, Beauty & Fashion, Home & DIY, Science, Sports, Automotive, Gaming, Pets & Animals, News & Politics, Religion & Spirituality, Kids & Family, Other).
2. Custom Niche: Identify the specific, targeted sub-niche (e.g., YouTube SEO, Air Fryer Recipes, Crypto Trading, Interior Design, AI Tools, Passive Income, etc.).

PRIORITY RULES:
- Even if Category Hint or Custom Niche Hint are empty, analyze the custom video concept and focus keywords to classify them.
- If keywords are provided, they target the core search intent. Use them as the primary signal to determine the Major Category and specific focus.
- The Custom Niche must be determined by analyzing the specific video topic / angle.
- Format the result for "niche_detected" in a clean format: "Category → Custom Niche" (e.g. "Technology → AI Automation", "Business & Finance → Affiliate Marketing").

CATEGORY AND SUB-NICHE MAPPING REFERENCE:
Use these and similar groupings to align and calibrate the titles:
- "Business & Finance" includes: Investing, Stock Market, Crypto, Dropshipping, Affiliate Marketing, Entrepreneurship, Freelancing, Make Money Online, E-commerce
- "Technology" includes: AI Tools, Programming, Web Development, Software, Cybersecurity, SaaS, Tech Reviews, Apps
- "Health & Fitness" includes: Weight Loss, Nutrition, Gym, Bodybuilding, Yoga, Mental Health
- "Creative & Design" includes: Graphic Design, UI/UX, Canva, Photoshop, Illustration, Branding
- "Education" includes: Study Tips, Language Learning, Exam Preparation, Tutorials, Online Courses

INSTRUCTIONS:
1. Determine and return the active detected niche in "niche_detected" in "Category → Custom Niche" format using the mandated Auto-Detection logic.
2. Generate exactly 5 Track A (SEO-optimised) titles matching the Track A rules. Front-load the keywords or core topic term in the first 35 chars.
3. Generate exactly 5 Track B (Audience-psychology) titles matching the Track B rules. Use trigger vocabulary appropriate for the detected niche.
4. Deliver independent scores, algorithm safety evaluation, frameworks, and a specific "why" explanation for each of the 10 titles.
5. Emphasize original starting words and structural contrast across all 10 titles to prevent repetition.
`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: userPromptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            niche_detected: {
              type: Type.STRING,
              description: "The detected or confirmed YouTube niche from the 12 primary niches."
            },
            track_a: {
              type: Type.ARRAY,
              description: "5 SEO Keyword-Optimized titles",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  framework: { type: Type.STRING },
                  curiosity_score: { type: Type.INTEGER },
                  seo_score: { type: Type.INTEGER },
                  safety: { type: Type.STRING },
                  chars: { type: Type.INTEGER },
                  front_loaded: { type: Type.BOOLEAN },
                  why: { type: Type.STRING }
                },
                required: ["title", "framework", "curiosity_score", "seo_score", "safety", "chars", "front_loaded", "why"]
              }
            },
            track_b: {
              type: Type.ARRAY,
              description: "5 Audience Need Coverage titles",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  framework: { type: Type.STRING },
                  curiosity_score: { type: Type.INTEGER },
                  seo_score: { type: Type.INTEGER },
                  safety: { type: Type.STRING },
                  chars: { type: Type.INTEGER },
                  front_loaded: { type: Type.BOOLEAN },
                  why: { type: Type.STRING }
                },
                required: ["title", "framework", "curiosity_score", "seo_score", "safety", "chars", "front_loaded", "why"]
              }
            }
          },
          required: ["niche_detected", "track_a", "track_b"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No output generated from the AI model.");
    }

    const dataObj = JSON.parse(textOutput.trim());
    return res.json(dataObj);

  } catch (error: any) {
    console.error("Gemini Title Generation Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate titles. Please verify input settings." });
  }
});

const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(3000, () => console.log("Local: http://localhost:3000"));
export default app;