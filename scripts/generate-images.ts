import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";

const region = process.env.AWS_REGION || "us-east-1";
const client = new BedrockRuntimeClient({ region });

interface Phrase {
  id: string;
  phrase_en: string;
  source_title: string;
  source_title_ja: string;
  source_character: string;
  genre: string;
}

const genreStyle: Record<string, string> = {
  romance: "warm soft lighting, romantic atmosphere",
  action: "dynamic dramatic lighting, intense atmosphere",
  comedy: "bright cheerful colors, lighthearted atmosphere",
  drama: "cinematic lighting, emotional atmosphere",
  "sci-fi": "futuristic neon lighting, sci-fi atmosphere",
  animation: "colorful anime-style illustration, vibrant",
  thriller: "dark moody lighting, suspenseful atmosphere",
  fantasy: "magical ethereal lighting, fantasy atmosphere",
  horror: "dark eerie lighting, spooky atmosphere",
};

async function generateImage(phrase: Phrase): Promise<Buffer> {
  const style = genreStyle[phrase.genre] || "cinematic lighting";
  const prompt = [
    `A beautiful watercolor illustration of a movie scene.`,
    `Movie: "${phrase.source_title}".`,
    `Character ${phrase.source_character} in a memorable scene.`,
    `Style: ${style}, watercolor painting, soft brushstrokes, no text, no letters, no words, no subtitles.`,
  ].join(" ");

  console.log(`  Prompt: ${prompt.substring(0, 100)}...`);

  // Amazon Titan Image Generator G1 のリクエスト形式
  const body = JSON.stringify({
    taskType: "TEXT_IMAGE",
    textToImageParams: {
      text: prompt,
      negativeText:
        "text, letters, words, watermark, signature, blurry, ugly, deformed, low quality",
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      width: 1024,
      height: 576,
      cfgScale: 8.0,
      seed: Math.floor(Math.random() * 2147483647),
    },
  });

  const command = new InvokeModelCommand({
    modelId: "amazon.titan-image-generator-v1",
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return Buffer.from(result.images[0], "base64");
}

async function main() {
  const dataPath = resolve(__dirname, "../data/sample-phrases.json");
  const phrases: Phrase[] = JSON.parse(readFileSync(dataPath, "utf-8"));

  const outputDir = resolve(__dirname, "../public/images/phrases");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating images for ${phrases.length} phrases...\n`);

  for (const phrase of phrases) {
    const outputPath = resolve(outputDir, `${phrase.id}.webp`);

    if (existsSync(outputPath)) {
      console.log(`[skip] ${phrase.id} - already exists`);
      continue;
    }

    console.log(`[generate] ${phrase.id} - ${phrase.source_title_ja}`);

    try {
      const pngBuffer = await generateImage(phrase);
      // PNG → WebP に変換
      await sharp(pngBuffer).webp({ quality: 80 }).toFile(outputPath);
      console.log(`  → saved: ${outputPath}\n`);
    } catch (error) {
      console.error(`  → ERROR: ${error}\n`);
    }
  }

  console.log("Done!");
}

main();
