const fs = require("fs");
const path = require("path");

/**
 * Generates an image using Pollinations.ai and saves it locally as a .jpg file.
 * 
 * @param {string} prompt - The text prompt (e.g., "a modern tech poster")
 * @param {string} outputPath - Local filename or path to save the image (e.g., "modern_tech_poster.jpg")
 * @param {object} options - Optional dimensions (width, height, nologo)
 */
async function generateAndSaveImage(prompt, outputPath = "output_image.jpg", options = {}) {
  const width = options.width || 1080;
  const height = options.height || 1080;
  const nologo = options.nologo !== false ? "true" : "false";

  // 1. URL-encode the prompt string
  const encodedPrompt = encodeURIComponent(prompt);

  // 2. Construct the image generation URL
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=${nologo}`;

  console.log(`📡 Fetching Pollinations AI image: ${imageUrl}`);

  // 3. Fetch the image from the URL
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from Pollinations. Status: ${response.status}`);
  }

  // 4. Read the image binary data as a buffer
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 5. Ensure target directory exists and save locally as a .jpg file
  const fullPath = path.resolve(outputPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, buffer);
  console.log(`✅ Image saved successfully to: ${fullPath}`);

  return {
    imageUrl,
    localPath: fullPath,
  };
}

module.exports = { generateAndSaveImage };

// Example Usage Demonstration:
if (require.main === module) {
  const samplePrompt = "a modern tech poster";
  const targetFile = "modern_tech_poster.jpg";

  generateAndSaveImage(samplePrompt, targetFile)
    .then((result) => console.log("Result:", result))
    .catch((err) => console.error("Error:", err.message));
}
