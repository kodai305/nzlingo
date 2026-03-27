import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, extname } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const mimeTypes: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

async function uploadDir(localDir: string, bucket: string, remotePath: string) {
  if (!existsSync(localDir)) {
    console.log(`[skip] ${localDir} does not exist`);
    return;
  }

  const files = readdirSync(localDir);
  console.log(`\nUploading ${files.length} files to ${bucket}/${remotePath}/`);

  for (const file of files) {
    const filePath = resolve(localDir, file);
    const remoteFilePath = `${remotePath}/${file}`;
    const ext = extname(file);
    const contentType = mimeTypes[ext] || "application/octet-stream";

    console.log(`  [upload] ${remoteFilePath}`);

    const fileBuffer = readFileSync(filePath);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(remoteFilePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`    → ERROR: ${error.message}`);
    } else {
      console.log(`    → OK`);
    }
  }
}

async function main() {
  const outputDir = resolve(__dirname, "../output");

  await uploadDir(resolve(outputDir, "audio/phrases"), "audio", "phrases");
  await uploadDir(resolve(outputDir, "images/phrases"), "images", "phrases");

  console.log("\nDone! Files are accessible at:");
  console.log(
    `  ${supabaseUrl}/storage/v1/object/public/audio/phrases/<file>`
  );
  console.log(
    `  ${supabaseUrl}/storage/v1/object/public/images/phrases/<file>`
  );
}

main();
