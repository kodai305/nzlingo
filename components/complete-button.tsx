"use client";

import { useState } from "react";
import { markPhraseComplete } from "@/app/(app)/today/actions";

export function CompleteButton({
  phraseId,
  initialCompleted,
}: {
  phraseId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleComplete = async () => {
    if (completed || loading) return;
    setLoading(true);

    try {
      await markPhraseComplete(phraseId);
      setCompleted(true);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="text-center">
        <div
          className={`inline-flex items-center gap-2 rounded-full bg-green-50 px-6 py-3 text-green-700 ${
            showAnimation ? "animate-bounce" : ""
          }`}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          学習完了！
        </div>
        {showAnimation && (
          <p className="mt-3 text-sm text-text-secondary">
            すごい！明日もがんばろう
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="w-full rounded-xl bg-primary px-6 py-4 text-base font-medium text-white shadow-lg transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? "記録中..." : "学習完了！"}
    </button>
  );
}
