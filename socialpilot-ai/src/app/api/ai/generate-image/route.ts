import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style, aspectRatio, width, height } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Delegate image generation to backend FastAPI AI Provider Manager with exact aspect_ratio & dimensions
    const backendRes = await fetch(`${API_BASE_URL}/ai/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        style,
        aspect_ratio: aspectRatio || "1:1",
        width,
        height,
      }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      const imageUrl = data.image_url || data.imageUrl;
      return NextResponse.json({
        ...data,
        imageUrl,
        image_url: imageUrl,
      });
    }

    // Fallback URL formatting if backend service is offline
    let reqWidth = width || 1080;
    let reqHeight = height || 1080;
    if (!width || !height) {
      if (aspectRatio === "16:9") {
        reqWidth = 1200;
        reqHeight = 628;
      } else if (aspectRatio === "9:16") {
        reqWidth = 1080;
        reqHeight = 1920;
      } else if (aspectRatio === "4:5") {
        reqWidth = 1080;
        reqHeight = 1350;
      } else if (aspectRatio === "2:1") {
        reqWidth = 1200;
        reqHeight = 600;
      }
    }

    const encodedPrompt = encodeURIComponent(`${prompt}, ${style || "photorealistic"}, 8k resolution`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${reqWidth}&height=${reqHeight}&nologo=true`;

    return NextResponse.json({
      success: true,
      imageUrl,
      image_url: imageUrl,
      prompt,
      width: reqWidth,
      height: reqHeight,
      aspect_ratio: aspectRatio || "1:1",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
