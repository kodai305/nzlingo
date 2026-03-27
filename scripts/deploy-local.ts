import { createClient } from "@supabase/supabase-js";
import { readFileSync, copyFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DATA_DIR = resolve(__dirname, "../data/phrases");
const PUBLIC_AUDIO_DIR = resolve(__dirname, "../public/audio/phrases");
const PUBLIC_IMAGES_DIR = resolve(__dirname, "../public/images/phrases");

async function main() {
  if (!existsSync(DATA_DIR)) {
    console.error(`Error: ${DATA_DIR} does not exist. Run generate-content.ts first.`);
    process.exit(1);
  }

  mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
  mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });

  const phraseDirs = readdirSync(DATA_DIR).filter((d) =>
    d.startsWith("phrase_")
  ).sort();

  console.log(`Deploying ${phraseDirs.length} phrases to local...\n`);

  for (const dir of phraseDirs) {
    const phraseDir = resolve(DATA_DIR, dir);
    const dataPath = resolve(phraseDir, "data.json");

    if (!existsSync(dataPath)) {
      console.log(`[skip] ${dir} - no data.json`);
      continue;
    }

    const data = JSON.parse(readFileSync(dataPath, "utf-8"));
    console.log(`[deploy] ${data.id}: "${data.phrase_en}"`);

    // Copy audio to public/
    const audioSrc = resolve(phraseDir, "audio.mp3");
    if (existsSync(audioSrc)) {
      copyFileSync(audioSrc, resolve(PUBLIC_AUDIO_DIR, `${data.id}.mp3`));
      console.log(`  ✓ audio → public/audio/phrases/${data.id}.mp3`);
    }

    // Copy image to public/
    const imageSrc = resolve(phraseDir, "image.webp");
    if (existsSync(imageSrc)) {
      copyFileSync(imageSrc, resolve(PUBLIC_IMAGES_DIR, `${data.id}.webp`));
      console.log(`  ✓ image → public/images/phrases/${data.id}.webp`);
    }

    // Upsert to local Supabase
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

  console.log("Done! Restart dev server to see changes.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
