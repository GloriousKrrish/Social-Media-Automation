/**
 * ═══════════════════════════════════════════════════════════════════
 * SocialPilot AI — Resilient Image Generator
 * ═══════════════════════════════════════════════════════════════════
 *
 * Primary Route:   Gemini Native Image Gen (gemini-2.5-flash)
 * Fallback Route:  Pollinations.ai (free, no API key)
 *
 * Usage:
 *   node imagen-generator.mjs
 *   node imagen-generator.mjs "a futuristic city skyline at sunset"
 *   node imagen-generator.mjs "neon car" output.jpg
 *
 * Requires:
 *   npm install @google/genai dotenv
 * ═══════════════════════════════════════════════════════════════════
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

// ── Load environment variables ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "backend", ".env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set. Add it to backend/.env");
  process.exit(1);
}

// ── Initialize the Google GenAI client ──
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Gemini image-capable models to try (in priority order) ──
const GEMINI_IMAGE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-exp",
];

/**
 * Download a file from a URL to disk (follows redirects).
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const request = proto.get(url, { headers: { "User-Agent": "SocialPilotAI/1.0" } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on("finish", () => { fileStream.close(); resolve(destPath); });
      fileStream.on("error", reject);
    });
    request.on("error", reject);
    request.setTimeout(60000, () => { request.destroy(); reject(new Error("Download timed out")); });
  });
}

/**
 * PRIMARY ROUTE: Try Gemini native image generation via generateContent.
 * Returns the saved file path on success, or null on failure.
 */
async function tryGeminiNativeImage(promptText, outputPath) {
  for (const modelId of GEMINI_IMAGE_MODELS) {
    try {
      console.log(`\n⚡  [GEMINI PRIMARY] Trying model: ${modelId}...`);
      const startTime = Date.now();

      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate a high-quality 1:1 square social media image: ${promptText}. Make it visually stunning, professional, and suitable for Instagram/LinkedIn.`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const elapsedMs = Date.now() - startTime;
      console.log(`    ⏱  API responded in ${elapsedMs}ms`);

      // ── Safely extract inline image data from response parts ──
      if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content?.parts || [];
        console.log(`    📦  Response has ${parts.length} part(s)`);

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];

          if (part.text) {
            console.log(`    📝  Part ${i + 1}: Text — "${part.text.substring(0, 80)}..."`);
          }

          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || "image/png";
            const ext = mimeType.includes("png") ? ".png" : ".jpg";
            const finalPath = outputPath.replace(/\.[^.]+$/, ext);

            const imageBuffer = Buffer.from(part.inlineData.data, "base64");
            fs.writeFileSync(finalPath, imageBuffer);

            const fileSizeKB = (imageBuffer.length / 1024).toFixed(1);
            console.log(`    🖼  Part ${i + 1}: Image — ${mimeType} (${fileSizeKB} KB)`);
            console.log(`\n✅  [GEMINI NATIVE] Image generated successfully via ${modelId}`);
            console.log(`💾  Saved: ${finalPath}`);
            return finalPath;
          }
        }

        console.log(`    ⚠️  ${modelId}: Response contained no inline image data`);
      } else {
        console.log(`    ⚠️  ${modelId}: No candidates in response`);
      }
    } catch (err) {
      const errMsg = err.message || String(err);
      console.log(`    ❌  ${modelId} error: ${errMsg.substring(0, 150)}`);
    }
  }

  console.log(`\n⚠️  [GEMINI PRIMARY] All Gemini image models exhausted — no image produced`);
  return null;
}

/**
 * FALLBACK ROUTE: Generate image via Pollinations.ai (free, no API key).
 */
async function pollinationsFallback(promptText, outputPath) {
  console.log(`\n🔄  [POLLINATIONS FALLBACK] Generating image...`);
  const startTime = Date.now();

  const seed = Math.floor(Math.random() * 100000);
  const encodedPrompt = encodeURIComponent(promptText);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=${seed}&nologo=true`;

  console.log(`    🌐  URL: ${url.substring(0, 120)}...`);
  console.log(`    🎲  Seed: ${seed}`);

  await downloadFile(url, outputPath);

  const elapsedMs = Date.now() - startTime;
  const stats = fs.statSync(outputPath);
  const fileSizeKB = (stats.size / 1024).toFixed(1);

  console.log(`\n✅  [POLLINATIONS FALLBACK] Image generated in ${elapsedMs}ms`);
  console.log(`💾  Saved: ${outputPath} (${fileSizeKB} KB)`);
  return outputPath;
}

/**
 * Main entry: Generate a social media image with resilient pipeline.
 *
 * @param {string} promptText — The image description prompt.
 * @param {string} [fileName] — Output filename (default: generated_social_image.jpg).
 * @returns {Promise<string>} — Absolute path to the saved image.
 */
async function generateSocialImage(promptText, fileName = "generated_social_image.jpg") {
  console.log("══════════════════════════════════════════════════════");
  console.log("🎨  SocialPilot AI — Resilient Image Generator");
  console.log("══════════════════════════════════════════════════════");
  console.log(`📝  Prompt : "${promptText}"`);
  console.log(`📁  Output : ${fileName}`);
  console.log(`🔑  API Key: ${GEMINI_API_KEY.substring(0, 8)}...${GEMINI_API_KEY.slice(-4)}`);
  console.log("══════════════════════════════════════════════════════");

  const outputPath = path.resolve(__dirname, fileName);
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ── PRIMARY: Gemini Native Image Generation ──
  try {
    const geminiResult = await tryGeminiNativeImage(promptText, outputPath);
    if (geminiResult) {
      console.log("\n🏷️  Source: Gemini Native");
      return geminiResult;
    }
  } catch (err) {
    console.log(`\n⚠️  Gemini pipeline threw: ${err.message}`);
  }

  // ── FALLBACK: Pollinations.ai ──
  try {
    const fallbackResult = await pollinationsFallback(promptText, outputPath);
    console.log("\n🏷️  Source: Pollinations Fallback");
    return fallbackResult;
  } catch (err) {
    console.error(`\n❌  Both Gemini and Pollinations failed!`);
    console.error(`    Last error: ${err.message}`);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════════
(async () => {
  const userPrompt =
    process.argv[2] ||
    "A modern, sleek social media promotional poster for a tech startup, vibrant gradient background with blue and purple tones, minimalist design, professional typography, 8k quality";

  const outputFile = process.argv[3] || "generated_social_image.jpg";

  try {
    const savedPath = await generateSocialImage(userPrompt, outputFile);
    console.log(`\n══════════════════════════════════════════════════════`);
    console.log(`🎉  DONE — ${savedPath}`);
    console.log(`══════════════════════════════════════════════════════\n`);
  } catch (err) {
    console.error(`\n❌  FAILED — ${err.message}`);
    process.exit(1);
  }
})();
