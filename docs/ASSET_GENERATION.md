# コンテンツ生成手順

フレーズデータ・音声・画像を1つのスクリプトで一括生成し、ローカルまたは本番にデプロイする。

## 概要

```
npm run generate -- N
  │
  ├── 1. Bedrock Claude Sonnet 4.6 → フレーズJSON生成
  ├── 2. Amazon Polly (Neural) → MP3音声生成
  └── 3. Bedrock Titan Image Generator v2 → WebP画像生成
  │
  ↓ data/phrases/ にセットで保存
  │
  ├── phrase_001/
  │   ├── data.json    (フレーズデータ)
  │   ├── audio.mp3    (音声)
  │   └── image.webp   (シーンイラスト)
  ├── phrase_002/
  │   └── ...

npm run deploy:local   → public/ にコピー + ローカルDBに投入
npm run deploy:prod    → Supabase Storage にアップロード + 本番DBに投入
```

`data/phrases/` がマスターデータ。ローカルでも本番でも同じセットをデプロイできる。

## 前提条件

- AWS CLI が設定済み（`aws configure` or 環境変数）
- 以下のAWSサービスが利用可能:
  - **Bedrock Claude Sonnet 4.6** (inference profile: `us.anthropic.claude-sonnet-4-6`)
  - **Bedrock Titan Image Generator v2** (`amazon.titan-image-generator-v2:0`)
  - **Amazon Polly** (Neural音声)
- Bedrockモデルアクセスが有効化済み（AWS Console → Bedrock → Model access）

## コスト見積もり（100件）

| サービス | 単価 | 100件の費用 |
|----------|------|------------|
| Claude Sonnet 4.6 | ~$0.01/リクエスト | ~$1.00 |
| Amazon Polly Neural | $16/100万文字 | ~$0.08 |
| Titan Image v2 | ~$0.01/枚 | ~$1.00 |
| **合計** | | **~$2.10** |

## 生成手順

### 1. 環境変数セット

```bash
export AWS_REGION=us-east-1
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx  # supabase start で表示される値
```

### 2. コンテンツ生成

```bash
# 5件生成
npm run generate -- 5

# 10件生成
npm run generate -- 10
```

スクリプトは以下を自動で行う:
1. Claude がフレーズデータ（英語セリフ、日本語訳、解説等）をJSON生成
2. 各フレーズに対して Polly で音声MP3を生成
3. 各フレーズに対して Titan Image v2 でシーンイラストをWebP生成
4. `data/phrases/phrase_XXX/` にセットで保存

既存のフレーズとの重複は自動で回避される（Claudeへのプロンプトに既存リストを含める）。

IDは連番で自動採番（phrase_001, phrase_002, ...）。

### 3. ローカルにデプロイ

```bash
npm run deploy:local
```

- `data/phrases/*/audio.mp3` → `public/audio/phrases/` にコピー
- `data/phrases/*/image.webp` → `public/images/phrases/` にコピー
- 各フレーズのdata.json → ローカルSupabase `phrases` テーブルに upsert

### 4. 本番にデプロイ

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=xxx \
npm run deploy:prod
```

- 音声ファイル → Supabase Storage `audio` バケットにアップロード
- 画像ファイル → Supabase Storage `images` バケットにアップロード
- フレーズデータ → 本番 `phrases` テーブルに upsert

## フォールバック

アセット未生成でもアプリは動作する:
- **音声**: Web Speech API (ブラウザTTS) で自動フォールバック
- **画像**: ジャンル別グラデーション + 絵文字アイコンのプレースホルダーを表示

## フレーズの追加

既に生成済みのデータがある場合、追加分だけ生成される:

```bash
# 既に10件ある状態で5件追加（phrase_011〜015が生成される）
npm run generate -- 5
npm run deploy:local
```

## トラブルシューティング

### Claude JSON パースエラー
- Claude の出力に不正な改行やエスケープが含まれる場合がある
- スクリプトは自動修復を試みるが、失敗した場合はもう一度実行

### Titan Image フィルターエラー
- 映画名やキャラクター名がコンテンツフィルターに引っかかる場合がある
- プロンプトは映画名を含めず、シーンの雰囲気のみで生成する設計
- それでもフィルターに引っかかった場合、該当フレーズの画像はスキップされプレースホルダーで表示

### Bedrock モデルIDエラー
- `ValidationException: The provided model identifier is invalid`
  - クロスリージョン推論プロファイルIDを使用: `us.anthropic.claude-sonnet-4-6`
- `ResourceNotFoundException: This model version has reached the end of its life`
  - Titan Image Generator v1 は廃止済み。v2 (`amazon.titan-image-generator-v2:0`) を使用

### Polly エラー
- リージョンによっては Neural 音声が利用不可
- `us-east-1` を推奨
