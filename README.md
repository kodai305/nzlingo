# NZLingo

1日1フレーズ、映画・ドラマ・アニメのセリフで英語を学ぶPWAアプリ。

## 概要

- 毎日1つ、映画やドラマの名セリフを聞いて、理解して、口に出す
- 5分で完了するシンプルな学習フロー
- iPhone Safari からPWAとして利用可能

詳細は [docs/PRD.md](docs/PRD.md) を参照。

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Auth | Supabase Auth (Google OAuth + マジックリンク) |
| DB | Supabase (PostgreSQL) + RLS |
| Storage | Supabase Storage (音声・画像) |
| Audio生成 | Amazon Polly |
| Image生成 | Amazon Bedrock (Titan Image Generator v2) |
| PWA | Serwist |
| Hosting | Vercel (MVP) |

## ローカル開発

### 前提条件

- Node.js 20+
- Docker (Supabase ローカル用)
- AWS CLI (コンテンツ生成用、任意)

### セットアップ

```bash
# 依存関係インストール
npm install

# Supabase ローカル起動
npm run supabase:start
# → 表示されるキーを .env.local にコピー

# .env.local 作成（テンプレートからコピー）
cp .env.local.example .env.local
# → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY を設定

# DBマイグレーション + シードデータ投入
npm run supabase:reset

# 開発サーバー起動
npm run dev
```

http://localhost:3000 を開き、メールでログイン → [Mailpit](http://127.0.0.1:54324) でマジックリンクを確認。

### ローカル開発ツール

| ツール | URL | 用途 |
|--------|-----|------|
| アプリ | http://localhost:3000 | NZLingo本体 |
| Supabase Studio | http://127.0.0.1:54323 | DB管理・SQLエディタ |
| Mailpit | http://127.0.0.1:54324 | マジックリンクメール確認 |

## コンテンツ生成

フレーズデータ・音声・画像を一括生成するスクリプト:

```bash
# AWS認証を設定
export AWS_REGION=us-east-1

# 5件生成
npm run generate -- 5

# ローカルにデプロイ（public/にコピー + DB投入）
npm run deploy:local
```

詳細は [docs/ASSET_GENERATION.md](docs/ASSET_GENERATION.md) を参照。

## 本番デプロイ

[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) を参照。

## npm scripts

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run supabase:start` | ローカルSupabase起動 |
| `npm run supabase:stop` | ローカルSupabase停止 |
| `npm run supabase:reset` | DBリセット（マイグレーション+シード） |
| `npm run generate -- N` | N件のフレーズ・音声・画像を一括生成 |
| `npm run deploy:local` | ローカル環境にデプロイ |
| `npm run deploy:prod` | 本番環境にデプロイ |

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [docs/PRD.md](docs/PRD.md) | プロダクト要件定義 |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | 実装計画・技術設計 |
| [docs/ASSET_GENERATION.md](docs/ASSET_GENERATION.md) | コンテンツ生成手順 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 本番デプロイ手順 |
