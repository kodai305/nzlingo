# 本番デプロイ手順

## 必要なアカウント

1. **Supabase** (https://supabase.com) — DB + Auth + Storage
2. **Vercel** (https://vercel.com) — ホスティング
3. **Google Cloud Console** (https://console.cloud.google.com) — Google OAuth（任意、メールログインだけなら不要）

## 1. Supabase プロジェクト作成

1. https://supabase.com でサインアップ
2. **New Project** を作成（リージョン: Tokyo 推奨）
3. Project Settings → API から以下をメモ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### DBマイグレーション

Supabase Dashboard の **SQL Editor** で以下を順番に実行:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage_buckets.sql`

### 許可ユーザー登録

SQL Editor で:

```sql
INSERT INTO allowed_users (email) VALUES ('your-email@gmail.com');
```

### Auth 設定

1. Authentication → Providers → **Email** を有効化（マジックリンク）
2. Authentication → URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### Google OAuth 設定（任意）

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID**
   - Application type: Web application
   - Authorized redirect URIs: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
2. Supabase Dashboard → Authentication → Providers → **Google**
   - Client ID と Client Secret を入力
   - 有効化

## 2. Vercel デプロイ

1. GitHubにリポジトリをpush
2. https://vercel.com でサインアップ（GitHubアカウント推奨）
3. **Import Project** → リポジトリを選択
4. Environment Variables に以下を設定:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_USE_SUPABASE_STORAGE` | `true` |

5. **Deploy** をクリック

### Build Settings

Vercelのデフォルト設定で動作します:
- Build Command: `next build --webpack`（package.jsonで設定済み）
- Output Directory: `.next`

## 3. コンテンツを本番にデプロイ

ローカルで生成済みのコンテンツ（`data/phrases/`）を本番環境にデプロイ:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npm run deploy:prod
```

これにより:
- 音声ファイル → Supabase Storage `audio` バケット
- 画像ファイル → Supabase Storage `images` バケット
- フレーズデータ → `phrases` テーブル

## 4. 動作確認

1. `https://your-app.vercel.app` にアクセス
2. ログイン（Google or マジックリンク）
3. 今日のフレーズが表示されること
4. 音声再生ができること
5. 学習完了ボタンが動作すること
6. iPhone Safari で「ホーム画面に追加」→ PWAとして起動できること

## 環境変数まとめ

| 変数 | ローカル | 本番 |
|------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ローカルのキー | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ローカルのキー | Supabase service role key |
| `NEXT_PUBLIC_USE_SUPABASE_STORAGE` | 未設定（ローカルファイル使用） | `true` |

## トラブルシューティング

### ログインできない
- Supabase の URL Configuration で Redirect URLs に Vercel ドメインが含まれているか確認
- Google OAuth の場合、redirect URI が正しいか確認

### 音声・画像が表示されない
- `NEXT_PUBLIC_USE_SUPABASE_STORAGE=true` が設定されているか確認
- `npm run deploy:prod` でアセットがアップロードされているか確認
- Supabase Dashboard → Storage で `audio` / `images` バケットにファイルがあるか確認

### 未許可ユーザーエラー
- Supabase の `allowed_users` テーブルにメールアドレスが登録されているか確認
