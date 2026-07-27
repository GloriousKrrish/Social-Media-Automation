import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, topic, tone, audience, cta, keywords, apiKey, provider } = body;

    const promptText = topic || `The future of ${platform} automation and AI content strategy`;

    // ── STRATEGY 1: Forward to backend FastAPI Gemini Provider (3.5 → 2.5 → 1.5 fallback) ──
    try {
      const systemPrompt = `You are an expert social media strategist and master copywriter for ${platform || "LinkedIn"}. 
Tone: ${tone || "Professional"}. 
Target Audience: ${audience || "General Business Professionals"}.
Call to action: ${cta || "Engage with this post"}.
Include relevant emojis and hashtags. Make the content engaging, shareable, and actionable.
Keywords to include: ${keywords || "AI, Growth, Innovation"}.`;

      const backendRes = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write an engaging ${platform || "LinkedIn"} post about: ${promptText}`,
          system_prompt: systemPrompt,
          provider: "gemini",
          temperature: 0.8,
          max_tokens: 1200,
        }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.text && !data.text.startsWith("[Gemini") && data.finish_reason !== "error") {
          return NextResponse.json({
            success: true,
            text: data.text,
            source: `Gemini AI (${data.model || "gemini-3.5-flash"})`,
            model: data.model,
            provider: data.provider,
            latency_ms: data.latency_ms,
          });
        }
      }
    } catch (backendErr) {
      console.log("[Content Route] Backend Gemini unavailable, trying next strategy...", backendErr);
    }

    // ── STRATEGY 2: Direct OpenAI key (if user provided one) ──
    if (apiKey && provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert social media strategist and master copywriter for ${platform}. Tone: ${tone}. Target Audience: ${audience}. Call to action: ${cta}. Include relevant emojis and hashtags.`,
            },
            {
              role: "user",
              content: `Write an engaging post about: ${promptText}. Keywords to target: ${keywords || "AI, Growth, Innovation"}`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return NextResponse.json({ success: true, text: content, source: "OpenAI GPT-4o" });
        }
      }
    }

    // ── STRATEGY 3: High-quality procedural template engine (offline fallback) ──
    const platformTemplates: Record<string, (topic: string) => string> = {
      linkedin: (t) => `🚀 ${t.toUpperCase()} — Essential Strategy for B2B Growth in 2025

Key Takeaways:
1️⃣ Automation removes 80% of repetitive content creation bottlenecks.
2️⃣ Personalization at scale drives 4.2x higher engagement.
3️⃣ Data-backed insights establish immediate domain authority.

"The best way to predict the future of marketing is to automate it intelligently."

What's your take on integrating AI into your team's workflow?

👉 ${cta || "Drop your thoughts below"}

#B2BMarketing #AITools #LinkedInGrowth #${keywords ? keywords.replace(/,\s*/g, " #") : "Leadership #Growth"}`,

      twitter: (t) => `🤖 ${t}

Here are 3 rules for scaling content with AI:

1. Automate research, synthesize manually.
2. Focus on high-intent hooks.
3. Test 5+ variations per week.

The future belongs to agentic workflows. 🧵 👇

${cta || "Retweet to share with your network!"}`,

      instagram: (t) => `✨ ${t}

Swipe through for the step-by-step breakdown 📲

📌 Key Points:
• Automate routine distribution
• Optimize visual branding across channels
• Maintain strict brand voice consistency

Save this post for your next content strategy session! 💡

${cta || "Link in bio for full playbook!"}

#SocialMediaStrategy #ContentCreator #AIMarketing #GrowthHacks`,

      facebook: (t) => `💡 ${t}

Whether you're scaling a business or managing brand campaigns, leveraging intelligent agents allows you to focus on high-impact strategy while AI handles execution.

Here's how top brands are adapting right now...

${cta || "Join the discussion in the comments below!"}`,
    };

    const generator = platformTemplates[platform] || platformTemplates.linkedin;
    const generatedText = generator(promptText);

    return NextResponse.json({
      success: true,
      text: generatedText,
      source: "SocialPilot AI Template Engine (Offline Fallback)",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
