import { createClient } from "@/lib/supabase/server";
import { getTodayDisplayOrder } from "@/lib/utils";
import { PhraseCard } from "@/components/phrase-card";
import { StartTodayButton } from "@/components/start-today-button";
import type { Phrase } from "@/lib/types/database";

// キャッシュ無効化 — 毎回最新データを取得
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const supabase = await createClient();

  // フレーズ総数を取得
  const { count } = await supabase
    .from("phrases")
    .select("*", { count: "exact", head: true });

  const totalPhrases = count ?? 1;
  const displayOrder = getTodayDisplayOrder(totalPhrases);

  // 今日のフレーズを取得
  const { data: phrase } = await supabase
    .from("phrases")
    .select("*")
    .eq("display_order", displayOrder)
    .single();

  if (!phrase) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-text">
            フレーズがまだありません
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            コンテンツを追加してください
          </p>
        </div>
      </div>
    );
  }

  // 学習完了チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: progress } = await supabase
    .from("user_progress")
    .select("id")
    .eq("user_id", user!.id)
    .eq("phrase_id", phrase.id)
    .single();

  const isCompleted = !!progress;

  // 今日の日付（JST）
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <main className="pt-2">
      <div className="mb-2 px-4">
        <p className="text-xs text-text-secondary">{today}</p>
        <h1 className="text-lg font-bold text-text">今日のフレーズ</h1>
      </div>

      {isCompleted ? (
        <PhraseCard phrase={phrase as Phrase} isCompleted={true} />
      ) : (
        <StartTodayButton phrase={phrase as Phrase} />
      )}
    </main>
  );
}
