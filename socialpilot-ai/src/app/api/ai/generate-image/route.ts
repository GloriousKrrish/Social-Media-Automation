import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style, aspectRatio } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Delegate image generation to backend FastAPI AI Provider Manager
    const backendRes = await fetch(`${API_BASE_URL}/ai/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style, aspectRatio }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }

    // Fallback URL formatting if backend service is offline
    const encodedPrompt = encodeURIComponent(`${prompt}, ${style || "photorealistic"}, 8k resolution`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true`;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
