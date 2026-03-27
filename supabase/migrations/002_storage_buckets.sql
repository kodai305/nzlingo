-- 音声ファイル用バケット（公開）
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- 画像ファイル用バケット（公開）
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 公開バケットの読み取りポリシー（誰でも閲覧可）
CREATE POLICY "Public audio access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'audio');

CREATE POLICY "Public images access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- サービスロールのみアップロード可
CREATE POLICY "Service role audio upload"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Service role images upload"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'images');
