/**
 * ═══════════════════════════════════════════════════════════════════
 * SocialPilot AI — Google Gemini Image Generator
 * ═══════════════════════════════════════════════════════════════════
 *
 * Uses the official @google/genai SDK with the current Gemini
 * image generation model (gemini-2.0-flash-exp for image output).
 *
 * Fallback strategy if Gemini native image gen is unavailable:
 *   → Pollinations.ai free URL-based generation
 *
 * Usage:
 *   node imagen-generator.mjs
 *   node imagen-generator.mjs "a futuristic city skyline at sunset"
 *
 * Requires:
 *   npm install @google/genai dotenv
 *
 * Environment:
 *   GEMINI_API_KEY=your_google_api_key   (in backend/.env)
 * ═══════════════════════════════════════════════════════════════════
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

// ── Load environment variables from backend/.env ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "backend", ".env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set. Add it to backend/.env");
  process.exit(1);
}

// ── Initialize the Google GenAI client ──
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Image generation model tiers (fallback cascade) ──
const IMAGE_MODELS = [
  "gemini-2.0-flash-exp",           // Supports image output via generateContent
  "gemini-2.0-flash",               // Standard flash with image capabilities
];

/**
 * Download a file from a URL and save it to disk.
 * @param {string} url       — The URL to download from.
 * @param {string} destPath  — The local file path to write to.
 * @returns {Promise<string>} — Resolves with the destPath on success.
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const request = proto.get(url, { headers: { "User-Agent": "SocialPilotAI/1.0" } }, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on("finish", () => { fileStream.close(); resolve(destPath); });
      fileStream.on("error", reject);
    });
    request.on("error", reject);
    request.setTimeout(30000, () => { request.destroy(); reject(new Error("Download timed out")); });
  });
}

/**
 * Generate a social media image using Google Gemini (with Pollinations fallback).
 *
 * @param {string}  promptText  — The text prompt describing the image to generate.
 * @param {string}  [fileName]  — Optional output file path. Defaults to ./generated_image.jpg
 * @returns {Promise<string>}   — The absolute path to the saved image file.
 */
async function generateSocialImage(promptText, fileName = "generated_image.jpg") {
  console.log("══════════════════════════════════════════════════════");
  console.log("🎨  SocialPilot AI — Image Generator");
  console.log("══════════════════════════════════════════════════════");
  console.log(`📝  Prompt   : "${promptText}"`);
  console.log(`📁  Output   : ${fileName}`);
  console.log(`📐  Ratio    : 1:1 (Square — Social Post)`);
  console.log("══════════════════════════════════════════════════════\n");

  const outputPath = path.resolve(__dirname, fileName);
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ── STRATEGY 1: Try Gemini native image generation via generateContent ──
  for (const modelId of IMAGE_MODELS) {
    try {
      console.log(`⚡  Trying Gemini model: ${modelId}...`);
      const startTime = Date.now();

      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate a high-quality 1:1 square social media image based on this description: ${promptText}. Make it visually stunning, professional, and suitable for Instagram/LinkedIn posts.`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      });

      const elapsedMs = Date.now() - startTime;

      // Check if any part contains inline image data
      if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const imageBuffer = Buffer.from(part.inlineData.data, "base64");
            const mimeType = part.inlineData.mimeType || "image/png";
            const ext = mimeType.includes("png") ? ".png" : ".jpg";

            // Adjust filename extension if needed
            const finalPath = outputPath.replace(/\.[^.]+$/, ext);
            fs.writeFileSync(finalPath, imageBuffer);

            const fileSizeKB = (imageBuffer.length / 1024).toFixed(1);
            console.log(`✅  Gemini ${modelId} generated image in ${elapsedMs}ms`);
            console.log(`💾  Saved: ${finalPath} (${fileSizeKB} KB)`);
            console.log("══════════════════════════════════════════════════════\n");
            return finalPath;
          }
        }
      }

      console.log(`⚠️  ${modelId}: No image data in response, trying next tier...`);
    } catch (err) {
      console.log(`⚠️  ${modelId} failed: ${err.message?.substring(0, 120)}`);
    }
  }

  // ── STRATEGY 2: Pollinations.ai URL-based fallback (no API key needed) ──
  console.log("\n🔄  Falling back to Pollinations.ai image generation...");
  try {
    const startTime = Date.now();
    const encodedPrompt = encodeURIComponent(`${promptText}, professional social media post, 8k resolution, square format`);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true`;

    console.log(`⏳  Downloading from Pollinations.ai...`);
    await downloadFile(pollinationsUrl, outputPath);

    const elapsedMs = Date.now() - startTime;
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(1);

    console.log(`✅  Pollinations.ai generated image in ${elapsedMs}ms`);
    console.log(`💾  Saved: ${outputPath} (${fileSizeKB} KB)`);
    console.log("══════════════════════════════════════════════════════\n");
    return outputPath;
  } catch (fallbackErr) {
    console.error(`❌  Pollinations.ai fallback also failed: ${fallbackErr.message}`);
    throw fallbackErr;
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEST EXECUTION
// ═══════════════════════════════════════════════════════════════════
(async () => {
  const userPrompt =
    process.argv[2] ||
    "A modern, sleek social media promotional poster for a tech startup, vibrant gradient background with blue and purple tones, minimalist design, professional typography, 8k quality";

  const outputFile = process.argv[3] || "generated_social_image.jpg";

  try {
    const savedPath = await generateSocialImage(userPrompt, outputFile);
    console.log(`🎉  SUCCESS — image saved at: ${savedPath}`);
  } catch (err) {
    console.error(`❌  FAILED — ${err.message}`);
    process.exit(1);
  }
})();
