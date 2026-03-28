"use client";

import { useState } from "react";
import type { Phrase } from "@/lib/types/database";
import { PhraseCard } from "./phrase-card";
import { SceneImage } from "./scene-image";
import { getAssetUrl } from "@/lib/utils";

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

export function StartTodayButton({ phrase }: { phrase: Phrase }) {
  const [started, setStarted] = useState(false);

  if (started) {
    return <PhraseCard phrase={phrase} isCompleted={false} />;
  }

  const imageUrl = getAssetUrl(phrase.image_url);

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* プレビュー画像 */}
      <SceneImage
        src={imageUrl}
        alt={`${phrase.source_title_ja}のシーン`}
        genre={phrase.genre}
        genreLabel={genreLabelMap[phrase.genre] ?? phrase.genre}
      />

      {/* 出典ヒント */}
      <div className="mt-4 text-center">
        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-primary">
          {genreLabelMap[phrase.genre] ?? phrase.genre}
        </span>
        <p className="mt-2 text-sm text-text-secondary">
          {phrase.source_title_ja}（{phrase.source_year}）
        </p>
      </div>

      {/* スタートボタン */}
      <button
        onClick={() => setStarted(true)}
        className="mt-6 w-full rounded-2xl bg-primary px-6 py-5 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary-dark active:scale-[0.98]"
      >
        今日の学習を始める
      </button>

      <p className="mt-3 text-center text-xs text-text-secondary">
        5分で完了します
      </p>
    </div>
  );
}
