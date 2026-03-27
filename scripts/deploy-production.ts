import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, extname } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
      "For production, set these to your hosted Supabase project values."
  );
  process.exit(1);
}

if (supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost")) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL points to localhost. Use production URL.\n" +
      "Example: NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DATA_DIR = resolve(__dirname, "../data/phrases");

const mimeTypes: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".webp": "image/webp",
};

async function uploadFile(
  bucket: string,
  remotePath: string,
  localPath: string
): Promise<boolean> {
  const ext = extname(localPath);
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const fileBuffer = readFileSync(localPath);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(remotePath, fileBuffer, { contentType, upsert: true });

  if (error) {
    console.error(`    ✗ Storage upload error: ${error.message}`);
    return false;
  }
  return true;
}

async function main() {
  if (!existsSync(DATA_DIR)) {
    console.error(
      `Error: ${DATA_DIR} does not exist. Run generate-content.ts first.`
    );
    process.exit(1);
  }

  const phraseDirs = readdirSync(DATA_DIR)
    .filter((d) => d.startsWith("phrase_"))
    .sort();

  console.log(
    `Deploying ${phraseDirs.length} phrases to production (${supabaseUrl})...\n`
  );

  for (const dir of phraseDirs) {
    const phraseDir = resolve(DATA_DIR, dir);
    const dataPath = resolve(phraseDir, "data.json");

    if (!existsSync(dataPath)) {
      console.log(`[skip] ${dir} - no data.json`);
      continue;
    }

    const data = JSON.parse(readFileSync(dataPath, "utf-8"));
    console.log(`[deploy] ${data.id}: "${data.phrase_en}"`);

    // Upload audio to Supabase Storage
    const audioSrc = resolve(phraseDir, "audio.mp3");
    if (existsSync(audioSrc)) {
      const ok = await uploadFile(
        "audio",
        `phrases/${data.id}.mp3`,
        audioSrc
      );
      if (ok) console.log(`  ✓ audio uploaded`);
    }

    // Upload image to Supabase Storage
    const imageSrc = resolve(phraseDir, "image.webp");
    if (existsSync(imageSrc)) {
      const ok = await uploadFile(
        "images",
        `phrases/${data.id}.webp`,
        imageSrc
      );
      if (ok) console.log(`  ✓ image uploaded`);
    }

    // Upsert to production DB
    const { error } = await supabase.from("phrases").upsert(
      {
        id: data.id,
        phrase_en: data.phrase_en,
        phrase_ja: data.phrase_ja,
        source_title: data.source_title,
        source_title_ja: data.source_title_ja,
        source_character: data.source_character,
        source_year: data.source_year,
        genre: data.genre,
        image_url: data.image_url,
        audio_url: data.audio_url,
        explanation_summary: data.explanation_summary,
        explanation_vocabulary: data.explanation_vocabulary,
        explanation_usage: data.explanation_usage,
        explanation_grammar: data.explanation_grammar,
        difficulty: data.difficulty,
        display_order: data.display_order,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(`  ✗ DB error: ${error.message}`);
    } else {
      console.log(`  ✓ DB upserted`);
    }
    console.log();
  }

  console.log("Done! Production deployment complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
