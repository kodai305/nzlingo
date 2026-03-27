import type { Phrase } from "@/lib/types/database";
import { getAssetUrl } from "@/lib/utils";
import { AudioPlayer } from "./audio-player";
import { ExplanationSection } from "./explanation-section";
import { CompleteButton } from "./complete-button";
import { TranslationReveal } from "./translation-reveal";
import { SceneImage } from "./scene-image";

const genreLabelMap: Record<string, string> = {
  romance: "ロマンス",
  action: "アクション",
  comedy: "コメディ",
  drama: "ドラマ",
  "sci-fi": "SF",
  animation: "アニメ",
  thriller: "スリラー",
  fantasy: "ファンタジー",
  horror: "ホラー",
};

export function PhraseCard({
  phrase,
  isCompleted,
}: {
  phrase: Phrase;
  isCompleted: boolean;
}) {
  const imageUrl = getAssetUrl(phrase.image_url);
  const audioUrl = getAssetUrl(phrase.audio_url);

  return (
    <div className="mx-auto max-w-lg space-y-5 p-4">
      {/* シーンイラスト */}
      <SceneImage
        src={imageUrl}
        alt={`${phrase.source_title_ja}のシーン`}
        genre={phrase.genre}
        genreLabel={genreLabelMap[phrase.genre] ?? phrase.genre}
      />

      {/* 出典情報 */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-primary">
          {genreLabelMap[phrase.genre] ?? phrase.genre}
        </span>
        <span>
          {phrase.source_title_ja}（{phrase.source_year}）
        </span>
        <span>— {phrase.source_character}</span>
      </div>

      {/* 英語フレーズ + 音声 */}
      <div className="flex items-start gap-4">
        <p className="flex-1 text-2xl font-bold leading-relaxed text-text">
          {phrase.phrase_en}
        </p>
        <AudioPlayer src={audioUrl} text={phrase.phrase_en} />
      </div>

      {/* 日本語訳（タップで表示） */}
      <TranslationReveal translation={phrase.phrase_ja} />

      {/* 解説 */}
      <ExplanationSection
        summary={phrase.explanation_summary}
        vocabulary={phrase.explanation_vocabulary}
        usage={phrase.explanation_usage}
        grammar={phrase.explanation_grammar}
      />

      {/* 学習完了ボタン */}
      <CompleteButton phraseId={phrase.id} initialCompleted={isCompleted} />
    </div>
  );
}
