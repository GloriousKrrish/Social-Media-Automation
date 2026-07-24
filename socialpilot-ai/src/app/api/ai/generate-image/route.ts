import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style, aspectRatio, apiKey } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    let width = 1024;
    let height = 1024;

    if (aspectRatio === "16:9") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    } else if (aspectRatio === "4:5") {
      width = 800;
      height = 1000;
    } else if (aspectRatio === "2:1") {
      width = 1200;
      height = 600;
    }

    const enhancedPrompt = `${prompt}, ${style || "photorealistic"}, ultra-detailed, 8k resolution, professional lighting, clean aesthetic`;
    const seed = Math.floor(Math.random() * 1000000);

    // Generate real AI image URL via Pollinations Flux API
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      enhancedPrompt
    )}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

    return NextResponse.json({
      success: true,
      imageUrl,
      seed,
      prompt: enhancedPrompt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
