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
  genre TEXT NOT NULL CHECK (genre IN (
    'romance', 'action', 'comedy', 'drama', 'sci-fi',
    'animation', 'thriller', 'fantasy', 'horror'
  )),
  image_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  explanation_summary TEXT NOT NULL,
  explanation_vocabulary JSONB NOT NULL DEFAULT '[]',
  explanation_usage TEXT NOT NULL,
  explanation_grammar TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
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

-- Indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_completed_at ON user_progress(user_id, completed_at);
CREATE INDEX idx_phrases_display_order ON phrases(display_order);

-- Row Level Security
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- allowed_users: ミドルウェアからの読み取りのみ許可
CREATE POLICY "Allow read for authenticated users"
  ON allowed_users FOR SELECT
  TO authenticated
  USING (true);

-- phrases: 認証ユーザーが閲覧可
CREATE POLICY "Phrases are viewable by authenticated users"
  ON phrases FOR SELECT
  TO authenticated
  USING (true);

-- user_progress: 自分のレコードのみ
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
