module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { videoIdea, keywords, majorCategory, format, tone } = req.body;
    if (!videoIdea) {
      return res.status(400).json({ error: "Video Idea is required" });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "No API key configured" });
    }

  const prompt = `You are a YouTube SEO expert. Generate 10 video titles.

Video Idea: "${videoIdea}"
Keywords: ${JSON.stringify(keywords || [])}
Tone: "${tone || "Conversational"}"

Return ONLY this JSON format:
{
  "niche_detected": "Category -> Niche",
  "track_a": [
    {"title": "title here", "framework": "How-To", "curiosity_score": 75, "seo_score": 85, "safety": "SAFE", "chars": 45, "front_loaded": true, "why": "explanation"}
  ],
  "track_b": [
    {"title": "title here", "framework": "Curiosity Gap", "curiosity_score": 90, "seo_score": 70, "safety": "SAFE", "chars": 48, "front_loaded": false, "why": "explanation"}
  ]
}

RULES:
- track_a: exactly 5 SEO-optimized titles
- track_b: exactly 5 curiosity/psychology titles
- Max 65 characters per title
- ALL numeric values must be integers (e.g. 52, not "fifty-two")
- chars field must be a number, not words
- Return ONLY JSON, no markdown`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://youtube-title-generator.vercel.app",
      },
      body: JSON.stringify({
  model: "openrouter/free",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 6000
})
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from AI: " + JSON.stringify(data) });
    }

    const text = data.choices[0].message.content || "{}";
const jsonStart = text.indexOf("{");
const jsonEnd = text.lastIndexOf("}");
if (jsonStart === -1 || jsonEnd === -1) {
  return res.status(500).json({ error: "AI returned invalid response" });
}
const cleanJson = text.substring(jsonStart, jsonEnd + 1);
try {
  const parsed = JSON.parse(cleanJson);
  res.json(parsed);
} catch(e) {
  return res.status(500).json({ error: "JSON parse failed: " + cleanJson.substring(0, 200) });
}

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate titles" });
  }
};