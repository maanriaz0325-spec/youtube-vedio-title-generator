module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { videoIdea, keywords, majorCategory, format, tone } = req.body;
    if (!videoIdea) return res.status(400).json({ error: "Video Idea is required" });
    if (!process.env.OPENROUTER_API_KEY2) return res.status(500).json({ error: "No API key configured" });

    const callAI = async (prompt) => {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY2}`,
          "HTTP-Referer": "https://youtube-title-generator.vercel.app",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (!data.choices || !data.choices[0]) throw new Error("No AI response: " + JSON.stringify(data));
      return data.choices[0].message.content || "[]";
    };

    const trackAPrompt = `You are a YouTube SEO expert.
Generate exactly 5 SEO-optimized Track A titles for: "${videoIdea}"
Keywords: ${JSON.stringify(keywords || [])}
Tone: "${tone || "Conversational"}"

Track A rules:
- Front-load keywords in first 35 characters
- Max 65 characters
- Search intent focused

Return ONLY a JSON array:
[
  {"title": "exact title here", "framework": "How-To", "curiosity_score": 75, "seo_score": 88, "safety": "SAFE", "chars": 45, "front_loaded": true, "why": "specific reason"}
]
Return ONLY the array, no other text.`;

    const trackBPrompt = `You are a YouTube SEO expert.
Generate exactly 5 psychology-driven Track B titles for: "${videoIdea}"
Keywords: ${JSON.stringify(keywords || [])}
Tone: "${tone || "Conversational"}"

Track B rules:
- Use curiosity gaps and emotional triggers
- Max 65 characters
- Homepage/feed optimized

Return ONLY a JSON array:
[
  {"title": "exact title here", "framework": "Curiosity Gap", "curiosity_score": 92, "seo_score": 70, "safety": "SAFE", "chars": 48, "front_loaded": false, "why": "specific reason"}
]
Return ONLY the array, no other text.`;

    const nichePrompt = `What is the YouTube niche for: "${videoIdea}"?
Return ONLY: "Category -> Specific Niche" (example: "Cooking -> Budget Recipes")`;

    const [trackAText, trackBText, nicheText] = await Promise.all([
      callAI(trackAPrompt),
      callAI(trackBPrompt),
      callAI(nichePrompt)
    ]);

    const parseArray = (text) => {
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      if (start === -1 || end === -1) return [];
      try { return JSON.parse(text.substring(start, end + 1)); }
      catch(e) { return []; }
    };

    res.json({
      niche_detected: nicheText.trim().replace(/['"]/g, ""),
      track_a: parseArray(trackAText),
      track_b: parseArray(trackBText)
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate titles" });
  }
};