module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { videoIdea, keywords, majorCategory, customNiche, format, audience, tone, maturity } = req.body;

    if (!videoIdea) {
      return res.status(400).json({ error: "Video Idea is required" });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "No API key configured" });
    }

    const prompt = `You are YTGEN, an elite YouTube SEO strategist.

Generate exactly 10 YouTube video titles for:
- Video Idea: "${videoIdea}"
- Keywords: ${JSON.stringify(keywords || [])}
- Category: "${majorCategory || "Auto Detect"}"
- Format: "${format || "Standard"}"
- Tone: "${tone || "Conversational"}"

Return ONLY valid JSON:
{
  "niche_detected": "Category → Custom Niche",
  "track_a": [
    {
      "title": "SEO optimized title here",
      "framework": "How-To",
      "curiosity_score": 75,
      "seo_score": 85,
      "safety": "SAFE",
      "chars": 55,
      "front_loaded": true,
      "why": "reason this title works"
    }
  ],
  "track_b": [
    {
      "title": "Curiosity gap title here",
      "framework": "Curiosity Gap",
      "curiosity_score": 90,
      "seo_score": 70,
      "safety": "SAFE",
      "chars": 58,
      "front_loaded": false,
      "why": "reason this title works"
    }
  ]
}

RULES:
- track_a: exactly 5 SEO-optimized titles (keyword front-loaded in first 35 chars)
- track_b: exactly 5 curiosity/psychology titles
- Max 65 characters per title
- All titles must be unique and creative
- Return ONLY JSON, no markdown`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://youtube-title-generator.vercel.app",
      },
      body: JSON.stringify({
model: "qwen/qwen3-next-80b-a3b-instruct:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from AI: " + JSON.stringify(data) });
    }

    const text = data.choices[0].message.content || "{}";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const cleanJson = text.substring(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(cleanJson);
    res.json(parsed);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate titles" });
  }
};