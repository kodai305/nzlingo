# NZLingo 実装計画

## Context

NZLingoは1日1フレーズ、映画/ドラマのセリフで英語を学ぶPWAアプリ。30代日本人女性（子育て中）がiPhoneから手軽に使えることが最重要。PRDは `docs/PRD.md` に定義済み。

## 技術選定（PRDからの更新含む）

| 項目 | 採用 | 理由 |
|------|------|------|
| Frontend | **Next.js (App Router)** | SSR/SSG対応、PWA化しやすい |
| Styling | **Tailwind CSS** | 高速開発、レスポンシブ対応 |
| Auth | **Supabase Auth (Google OAuth + マジックリンク)** | DB+認証を一元化。`allowed_users`テーブルでホワイトリスト制御 |
| DB | **Supabase (PostgreSQL)** | 無料枠、RLSでセキュリティ担保 |
| Storage | **Supabase Storage** | 音声・画像ファイルをDBと一元管理。ローカルでもS3互換で動作 |
| Audio | **事前生成MP3 (Amazon Polly)** + Web Speech APIフォールバック | 品質一定。未生成時はブラウザTTSで代替 |
| Image | **事前生成 (Bedrock + Stable Diffusion)** + ジャンル別プレースホルダー | 未生成時はグラデーション+アイコンで表示 |
| PWA | **Serwist** | next-pwaはメンテ停止。Serwistが後継 |
| Hosting | **Vercel（MVP）** | Next.jsとの親和性 |

## ホスティング移行戦略

- **MVP**: Vercel — Supabase Storageから音声・画像を配信。AWSはローカルでの事前生成のみ
- **将来**: アプリ内でBedrockを直接呼ぶ機能が必要になった段階で → AWS Amplifyへ移行

## アセット管理

音声・画像ファイルは **Supabase Storage** に保存。gitにはバイナリを含めない。

```
生成〜配信フロー:

[ローカルPC] → scripts/generate-audio.ts  → Amazon Polly  → MP3
[ローカルPC] → scripts/generate-images.ts → Bedrock SD    → WebP
                    ↓
             scripts/upload-assets.ts → Supabase Storage にアップロード
                    ↓
             phrases テーブルの audio_url / image_url にStorageパスを保存
                    ↓
             アプリ → Supabase Storage 公開URL で配信
```

### Storageバケット構成

| バケット | 公開設定 | 用途 |
|----------|---------|------|
| `audio` | public | フレーズ音声ファイル (MP3) |
| `images` | public | シーンイラスト (WebP) |

### フォールバック

- **音声未生成時**: Web Speech API (ブラウザTTS) でフレーズを読み上げ
- **画像未生成時**: ジャンル別グラデーション + 絵文字アイコンのプレースホルダーを表示

## ディレクトリ構成

```
nzlingo/
├── .env.local                      # Supabase keys
├── .env.local.example              # 環境変数テンプレート
├── next.config.ts                  # Next.js + Serwist設定
├── package.json
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # PWA icons
├── app/
│   ├── sw.ts                       # Service Worker (Serwist)
│   ├── layout.tsx                  # Root layout (PWA metadata)
│   ├── page.tsx                    # → /today にリダイレクト
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx          # ログイン画面（Google + マジックリンク）
│   │   ├── auth/callback/route.ts  # OAuth/マジックリンク callback
│   │   └── unauthorized/page.tsx   # 未許可ユーザー画面
│   ├── (app)/
│   │   ├── layout.tsx              # 認証済みレイアウト + ナビバー
│   │   ├── today/
│   │   │   ├── page.tsx            # 今日のフレーズ（メイン画面）
│   │   │   └── actions.ts          # Server Action（学習完了）
│   │   ├── history/page.tsx        # 学習履歴
│   │   └── phrase/[id]/page.tsx    # フレーズ詳細（復習用）
│   └── ~offline/page.tsx           # オフライン時のフォールバック
├── components/
│   ├── phrase-card.tsx             # フレーズ表示カード
│   ├── scene-image.tsx             # シーン画像（プレースホルダー付き）
│   ├── audio-player.tsx            # 音声再生（Storage MP3 + Web Speech API フォールバック）
│   ├── translation-reveal.tsx      # タップで日本語訳表示
│   ├── explanation-section.tsx     # 解説（単語・文法・使い方）
│   ├── complete-button.tsx         # 学習完了ボタン
│   ├── progress-calendar.tsx       # カレンダー/ストリーク表示
│   └── nav-bar.tsx                 # 下部タブナビ
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # ブラウザ用クライアント
│   │   └── server.ts               # サーバー用クライアント
│   ├── types/database.ts           # 型定義
│   └── utils.ts                    # ユーティリティ（日付計算、Storage URL生成）
├── middleware.ts                    # 認証 + ホワイトリストチェック
├── scripts/
│   ├── seed-phrases.ts             # フレーズデータ投入
│   ├── generate-audio.ts           # Amazon Pollyで音声生成
│   ├── generate-images.ts          # Bedrock + SDでイラスト生成
│   └── upload-assets.ts            # Supabase Storageへアップロード
├── data/
│   └── sample-phrases.json         # サンプルフレーズデータ
└── supabase/
    ├── config.toml                 # ローカルSupabase設定
    ├── seed.sql                    # シードデータ（フレーズ + 許可ユーザー）
    └── migrations/
        ├── 001_initial_schema.sql  # テーブル + RLS
        └── 002_storage_buckets.sql # Storageバケット + ポリシー
```

## DBスキーマ

```sql
-- 許可ユーザーテーブル（ホワイトリスト）
CREATE TABLE allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- フレーズテーブル
CREATE TABLE phrases (
  id TEXT PRIMARY KEY,
  phrase_en TEXT NOT NULL,
  phrase_ja TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_title_ja TEXT NOT NULL,
  source_character TEXT NOT NULL,
  source_year INTEGER NOT NULL,
  genre TEXT NOT NULL,
  image_url TEXT NOT NULL,        -- Storageパス: "images/phrases/phrase_001.webp"
  audio_url TEXT NOT NULL,        -- Storageパス: "audio/phrases/phrase_001.mp3"
  explanation_summary TEXT NOT NULL,
  explanation_vocabulary JSONB NOT NULL DEFAULT '[]',
  explanation_usage TEXT NOT NULL,
  explanation_grammar TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  display_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 学習記録テーブル
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phrase_id TEXT NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, phrase_id)
);
```

## ローカル開発

```bash
# 1. Supabase ローカル起動
npm run supabase:start

# 2. .env.local を作成（supabase startで表示されるキーを使用）
cp .env.local.example .env.local
# → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY を設定

# 3. DBリセット（マイグレーション + シードデータ投入）
npm run supabase:reset

# 4. 開発サーバー起動
npm run dev

# 5. ブラウザで http://localhost:3000 を開く
# 6. メールでログイン → Mailpit (http://127.0.0.1:54324) でマジックリンク確認
```

### ローカル開発ツール

| ツール | URL | 用途 |
|--------|-----|------|
| Next.js dev | http://localhost:3000 | アプリ本体 |
| Supabase Studio | http://127.0.0.1:54323 | DB管理、SQLエディタ |
| Mailpit | http://127.0.0.1:54324 | マジックリンクメール確認 |

## 実装フェーズ

### Phase 1-4: 完了
- プロジェクト初期化（Next.js + Tailwind + Serwist PWA）
- 認証（Supabase Auth: Google OAuth + マジックリンク + ホワイトリスト）
- メイン機能（今日のフレーズ表示・音声再生・解説・学習完了）
- 学習履歴（カレンダー・ストリーク・復習）

### Phase 5: コンテンツ生成 — 完了
- `generate-content.ts` で Claude + Polly + Titan Image v2 を使った一括生成スクリプト実装
- `deploy-local.ts` / `deploy-production.ts` でローカル・本番それぞれにデプロイ可能
- `data/phrases/` をマスターデータとして管理（ローカル・本番で同じセットを使用）
- 詳細は [ASSET_GENERATION.md](ASSET_GENERATION.md) を参照

### Phase 6: PWA仕上げ + デプロイ — 未着手
- Supabase 本番プロジェクト作成
- Vercel デプロイ + 環境変数設定
- Google OAuth 設定（任意）
- Service Workerのキャッシュ戦略調整
- iPhone Safariでの動作検証（safe area、audio、standalone mode）
- 詳細は [DEPLOYMENT.md](DEPLOYMENT.md) を参照

## コンテンツ管理の設計

```
generate-content.ts (AWS)
  ↓ data/phrases/ に保存（マスターデータ）
  ↓
  ├── deploy-local.ts  → public/ にコピー + ローカルDB
  └── deploy-prod.ts   → Supabase Storage + 本番DB
```

- ローカル: `public/` から直接配信（`NEXT_PUBLIC_USE_SUPABASE_STORAGE` 未設定）
- 本番: Supabase Storage から配信（`NEXT_PUBLIC_USE_SUPABASE_STORAGE=true`）
- `getAssetUrl()` (`lib/utils.ts`) で環境に応じたURLを自動生成

## iPhone Safari 注意点
- `env(safe-area-inset-bottom)` でホームインジケータ対応
- `100dvh` 使用（`100vh`はSafariで不正確）
- 音声再生はユーザータップ起因必須（autoplay不可）
- `viewport-fit=cover` + `apple-mobile-web-app-capable`

## 検証方法
1. `npm run dev` でローカル起動
2. メールでログイン → Mailpitでマジックリンク確認
3. 今日のフレーズの表示・音声再生・学習完了の一連フロー確認
4. 履歴ページでの記録・ストリーク確認
5. iPhone実機でPWAインストール → standalone mode動作確認
6. オフライン時のフォールバック表示確認
