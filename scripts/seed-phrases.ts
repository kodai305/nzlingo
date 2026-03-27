import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
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

async function seed() {
  const filePath = resolve(__dirname, "../data/sample-phrases.json");
  const phrases = JSON.parse(readFileSync(filePath, "utf-8"));

  console.log(`Seeding ${phrases.length} phrases...`);

  const { error } = await supabase.from("phrases").upsert(phrases, {
    onConflict: "id",
  });

  if (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${phrases.length} phrases.`);
}

seed();
