import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import { resolve } from "path";
import sharp from "sharp";

// ---- Config ----
const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });
const polly = new PollyClient({ region });

const CLAUDE_MODEL_ID = "us.anthropic.claude-sonnet-4-6";
const TITAN_IMAGE_MODEL_ID = "amazon.titan-image-generator-v2:0";

const DATA_DIR = resolve(__dirname, "../data/phrases");
const count = parseInt(process.argv[2] || "5", 10);

// ---- Types ----
interface PhraseData {
  id: string;
  phrase_en: string;
  phrase_ja: string;
  source_title: string;
  source_title_ja: string;
  source_character: string;
  source_year: number;
  genre: string;
  explanation_summary: string;
  explanation_vocabulary: { word: string; meaning: string; note: string }[];
  explanation_usage: string;
  explanation_grammar: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

// ---- Helpers ----
function getNextId(): string {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
    return "phrase_001";
  }
  const existing = readdirSync(DATA_DIR).filter((d) =>
    d.startsWith("phrase_")
  );
  const maxNum = existing.reduce((max, d) => {
    const num = parseInt(d.replace("phrase_", ""), 10);
    return num > max ? num : max;
  }, 0);
  return `phrase_${String(maxNum + 1).padStart(3, "0")}`;
}

function getExistingPhrases(): string[] {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR)
    .filter((d) => {
      const dataPath = resolve(DATA_DIR, d, "data.json");
      return existsSync(dataPath);
    })
    .map((d) => {
      const data = JSON.parse(
        readFileSync(resolve(DATA_DIR, d, "data.json"), "utf-8")
      );
      return `${data.phrase_en} (${data.source_title})`;
    });
}

// ---- Step 1: Generate phrase data with Claude ----
async function generatePhraseData(
  batchSize: number
): Promise<PhraseData[]> {
  const existing = getExistingPhrases();
  const existingList =
    existing.length > 0
      ? `\n\n以下は既に登録済みのフレーズです。これらと重複しないようにしてください:\n${existing.map((p) => `- ${p}`).join("\n")}`
      : "";

  const prompt = `あなたは英語学習コンテンツの作成者です。映画・ドラマ・アニメの有名なセリフを使った英会話学習フレーズを${batchSize}件生成してください。

## ターゲットユーザー
- 30代の日本人女性
- 知っていそうな映画・ドラマ・アニメを選ぶ
- 日本でヒットした洋画、有名海外ドラマ、日本アニメの英語版など

## 作品の例
映画: ハリー・ポッター、アナと雪の女王、タイタニック、プラダを着た悪魔、ラ・ラ・ランド、マイ・インターン、ノッティングヒルの恋人、ローマの休日
ドラマ: フレンズ、ゴシップガール、エミリー パリへ行く、ストレンジャー・シングス
アニメ英語版: ジブリ作品、鬼滅の刃、SPY×FAMILY、進撃の巨人、ディズニー/ピクサー

## NG基準
- 過度に暴力的・下品なセリフは避ける
- 専門用語が多すぎて実用性がないものは避ける
- 日本での知名度が低い作品は避ける

## genre の選択肢
romance, action, comedy, drama, sci-fi, animation, thriller, fantasy, horror

## difficulty の選択肢
beginner, intermediate, advanced（初中級者向けなのでbeginnerとintermediateを多めに）

## 出力形式
JSON配列で返してください。余計なテキストは不要です。
\`\`\`json
[
  {
    "phrase_en": "英語のセリフ",
    "phrase_ja": "自然な日本語訳",
    "source_title": "Movie Title (English)",
    "source_title_ja": "映画タイトル（日本語）",
    "source_character": "Character Name",
    "source_year": 2000,
    "genre": "drama",
    "explanation_summary": "このセリフの背景と意味の解説（2-3文）",
    "explanation_vocabulary": [
      {"word": "表現", "meaning": "意味", "note": "使い方の補足"}
    ],
    "explanation_usage": "日常でどういう場面で使えるかの説明",
    "explanation_grammar": "文法的なポイントの説明",
    "difficulty": "beginner"
  }
]
\`\`\`

重要: JSON配列のみを返してください。コードブロック(\`\`\`json)で囲んでも構いませんが、JSON以外の説明文は一切不要です。文字列内のダブルクォートは必ず\\"でエスケープしてください。${existingList}`;

  console.log(`[Claude] Generating ${batchSize} phrases...`);

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const command = new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  const text: string = result.content[0].text;

  // JSON部分を抽出
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[Claude] Response text:\n", text);
    throw new Error("Claude response did not contain valid JSON array");
  }

  let phrases: PhraseData[];
  try {
    phrases = JSON.parse(jsonMatch[0]);
  } catch (e) {
    // JSON文字列値の中の生改行を \\n に置換して修復を試みる
    // "..." の中の改行だけを対象にする
    const fixed = jsonMatch[0].replace(
      /"(?:[^"\\]|\\.)*"/g,
      (match) => match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
    );
    try {
      phrases = JSON.parse(fixed);
      console.log(`[Claude] JSON repaired (fixed newlines in strings)`);
    } catch {
      console.error("[Claude] Failed to parse JSON. Raw text:\n", jsonMatch[0].substring(0, 1000));
      throw e;
    }
  }

  console.log(`[Claude] Generated ${phrases.length} phrases\n`);
  return phrases;
}

// ---- Step 2: Generate audio with Polly ----
async function generateAudio(text: string): Promise<Buffer> {
  const command = new SynthesizeSpeechCommand({
    Engine: "neural",
    LanguageCode: "en-US",
    OutputFormat: "mp3",
    Text: text,
    VoiceId: "Joanna",
  });

  const response = await polly.send(command);
  const stream = response.AudioStream;
  if (!stream) throw new Error("No audio stream returned");

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// ---- Step 3: Generate image with Titan ----
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

async function generateImage(phrase: PhraseData): Promise<Buffer> {
  const style = genreStyle[phrase.genre] || "cinematic lighting";
  // 映画名やキャラクター名を含めるとコンテンツフィルターに引っかかるため、
  // シーンの雰囲気とジャンルだけで描写する
  const prompt = [
    `A beautiful watercolor illustration.`,
    `Scene: a person expressing the feeling of "${phrase.phrase_en}".`,
    `Style: ${style}, watercolor painting, soft brushstrokes, no text, no letters, no words.`,
  ].join(" ");

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
      height: 1024,
      cfgScale: 8.0,
      seed: Math.floor(Math.random() * 2147483647),
    },
  });

  const command = new InvokeModelCommand({
    modelId: TITAN_IMAGE_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return Buffer.from(result.images[0], "base64");
}

// ---- Main ----
async function main() {
  console.log(`=== NZLingo Content Generator ===`);
  console.log(`Generating ${count} phrase(s)...\n`);

  // Step 1: Claude でフレーズデータ生成
  const phrases = await generatePhraseData(count);

  // 既存の最大IDを取得
  let nextIdNum = 1;
  if (existsSync(DATA_DIR)) {
    const existing = readdirSync(DATA_DIR).filter((d) =>
      d.startsWith("phrase_")
    );
    nextIdNum =
      existing.reduce((max, d) => {
        const num = parseInt(d.replace("phrase_", ""), 10);
        return num > max ? num : max;
      }, 0) + 1;
  }

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    const id = `phrase_${String(nextIdNum + i).padStart(3, "0")}`;
    phrase.id = id;

    const phraseDir = resolve(DATA_DIR, id);
    mkdirSync(phraseDir, { recursive: true });

    console.log(
      `[${i + 1}/${phrases.length}] ${id}: "${phrase.phrase_en}" (${phrase.source_title_ja})`
    );

    // Save phrase data
    const dataWithPaths = {
      ...phrase,
      image_url: `images/phrases/${id}.webp`,
      audio_url: `audio/phrases/${id}.mp3`,
      display_order: nextIdNum + i,
    };
    writeFileSync(
      resolve(phraseDir, "data.json"),
      JSON.stringify(dataWithPaths, null, 2),
      "utf-8"
    );
    console.log(`  ✓ data.json`);

    // Step 2: Polly で音声生成
    try {
      const audioBuffer = await generateAudio(phrase.phrase_en);
      writeFileSync(resolve(phraseDir, "audio.mp3"), audioBuffer);
      console.log(`  ✓ audio.mp3`);
    } catch (error) {
      console.error(`  ✗ audio.mp3 - ${error}`);
    }

    // Step 3: Titan で画像生成
    try {
      const imageBuffer = await generateImage(phrase);
      await sharp(imageBuffer)
        .webp({ quality: 80 })
        .toFile(resolve(phraseDir, "image.webp"));
      console.log(`  ✓ image.webp`);
    } catch (error) {
      console.error(`  ✗ image.webp - ${error}`);
    }

    console.log();
  }

  console.log(`=== Done! Generated ${phrases.length} phrases in ${DATA_DIR} ===`);
  console.log(`\nNext steps:`);
  console.log(`  npx tsx scripts/deploy-local.ts    # ローカルにデプロイ`);
  console.log(`  npx tsx scripts/deploy-production.ts  # 本番にデプロイ`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
