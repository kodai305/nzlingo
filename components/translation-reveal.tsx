"use client";

import { useState } from "react";

export function TranslationReveal({ translation }: { translation: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      onClick={() => setRevealed(!revealed)}
      className="w-full rounded-xl bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100"
    >
      {revealed ? (
        <p className="text-base text-text">{translation}</p>
      ) : (
        <p className="text-sm text-text-secondary">
          タップして日本語訳を見る
        </p>
      )}
    </button>
  );
}
