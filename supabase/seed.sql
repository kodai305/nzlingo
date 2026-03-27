-- サンプルの許可ユーザー（ローカル開発用）
INSERT INTO allowed_users (email) VALUES
  ('user@example.com'),
  ('takagi.305216@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- サンプルフレーズデータ
-- image_url / audio_url は Supabase Storage 内のパス（バケット名/パス）
INSERT INTO phrases (id, phrase_en, phrase_ja, source_title, source_title_ja, source_character, source_year, genre, image_url, audio_url, explanation_summary, explanation_vocabulary, explanation_usage, explanation_grammar, difficulty, display_order) VALUES
(
  'phrase_001',
  'You had me at hello.',
  '「ハロー」で私の心は決まってた。',
  'Jerry Maguire',
  'ザ・エージェント',
  'Dorothy Boyd',
  1996,
  'romance',
  'images/phrases/phrase_001.webp',
  'audio/phrases/phrase_001.mp3',
  '映画のクライマックスで使われる有名なセリフ。「had me」は「心を掴んだ」という意味。',
  '[{"word": "had me", "meaning": "（心を）掴んだ、虜にした", "note": "have + 人 で「〜を虜にする」というカジュアルな表現"}]',
  '相手に「最初から好きだった」と伝えたい時に使える表現。告白やロマンチックな場面で。',
  '「had me at ~」で「〜の時点で心を掴まれた」というイディオム。atの後には具体的な瞬間やきっかけが入る。',
  'beginner',
  1
),
(
  'phrase_002',
  'Life is like a box of chocolates. You never know what you''re gonna get.',
  '人生はチョコレートの箱みたいなもの。何が出てくるかわからない。',
  'Forrest Gump',
  'フォレスト・ガンプ',
  'Forrest Gump',
  1994,
  'drama',
  'images/phrases/phrase_002.webp',
  'audio/phrases/phrase_002.mp3',
  'フォレストの母が教えてくれた人生哲学。「gonna」は「going to」のカジュアルな言い方。',
  '[{"word": "gonna", "meaning": "〜するつもり、〜になる（going toの口語形）", "note": "日常会話では非常によく使われる。ビジネスメールでは避ける"}, {"word": "a box of chocolates", "meaning": "チョコレートの詰め合わせ箱", "note": "アメリカでは中身がわからない詰め合わせが定番。比喩として「予測不能なもの」"}]',
  '先が読めない状況を前向きに表現したい時に。旅行先で予想外のことが起きた時などに使える。',
  '「be like ~」で「〜のようだ」。「what you''re gonna get」は間接疑問文で「何を得るか」。',
  'beginner',
  2
),
(
  'phrase_003',
  'Let it go, let it go. Can''t hold it back anymore.',
  'ありのままで。もう抑えきれない。',
  'Frozen',
  'アナと雪の女王',
  'Elsa',
  2013,
  'animation',
  'images/phrases/phrase_003.webp',
  'audio/phrases/phrase_003.mp3',
  'エルサが自分の力を解放する名シーンの歌詞。「let it go」は日常でもよく使われる表現。',
  '[{"word": "let it go", "meaning": "手放す、気にしない、もういいよ", "note": "「もう気にするのはやめよう」という意味でも使う。友人への助言にも"}, {"word": "hold back", "meaning": "抑える、我慢する", "note": "感情や涙を「hold back」するという使い方が多い"}]',
  '何かを思い切って手放す時、過去のことを気にしすぎている人に「Let it go.」と声をかける。',
  '「let + 目的語 + 動詞の原形」で「〜させる」。「can''t ~ anymore」で「もう〜できない」。',
  'beginner',
  3
)
ON CONFLICT (id) DO NOTHING;
