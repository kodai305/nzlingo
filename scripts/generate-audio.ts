import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const region = process.env.AWS_REGION || "us-east-1";
const client = new PollyClient({ region });

interface Phrase {
  id: string;
  phrase_en: string;
  source_title_ja: string;
}

async function generateAudio(text: string): Promise<Buffer> {
  const command = new SynthesizeSpeechCommand({
    Engine: "neural",
    LanguageCode: "en-US",
    OutputFormat: "mp3",
    Text: text,
    VoiceId: "Joanna",
  });

  const response = await client.send(command);
  const stream = response.AudioStream;
  if (!stream) throw new Error("No audio stream returned");

  // ReadableStream → Buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function main() {
  const dataPath = resolve(__dirname, "../data/sample-phrases.json");
  const phrases: Phrase[] = JSON.parse(readFileSync(dataPath, "utf-8"));

  const outputDir = resolve(__dirname, "../public/audio/phrases");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating audio for ${phrases.length} phrases...\n`);

  for (const phrase of phrases) {
    const outputPath = resolve(outputDir, `${phrase.id}.mp3`);

    if (existsSync(outputPath)) {
      console.log(`[skip] ${phrase.id} - already exists`);
      continue;
    }

    console.log(`[generate] ${phrase.id} - "${phrase.phrase_en}"`);

    try {
      const buffer = await generateAudio(phrase.phrase_en);
      writeFileSync(outputPath, buffer);
      console.log(`  → saved: ${outputPath}\n`);
    } catch (error) {
      console.error(`  → ERROR: ${error}\n`);
    }
  }

  console.log("Done!");
}

main();
