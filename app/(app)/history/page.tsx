import { createClient } from "@/lib/supabase/server";
import { calculateStreak } from "@/lib/utils";
import { ProgressCalendar } from "@/components/progress-calendar";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 学習履歴を取得（フレーズ情報込み）
  const { data: progressList } = await supabase
    .from("user_progress")
    .select("*, phrases(*)")
    .eq("user_id", user!.id)
    .order("completed_at", { ascending: false });

  const completedDates = (progressList ?? []).map(
    (p) => new Date(p.completed_at)
  );
  const streak = calculateStreak(completedDates);

  return (
    <main className="mx-auto max-w-lg p-4">
      <h1 className="text-lg font-bold text-text">学習履歴</h1>

      {/* ストリーク */}
      <div className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
        <p className="text-sm opacity-80">連続学習</p>
        <p className="text-3xl font-bold">{streak}日</p>
      </div>

      {/* カレンダー */}
      <div className="mt-4">
        <ProgressCalendar completedDates={completedDates} />
      </div>

      {/* 履歴リスト */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-text-secondary">
          学習済みフレーズ
        </h2>
        {(progressList ?? []).length === 0 ? (
          <p className="text-sm text-text-secondary">
            まだ学習したフレーズがありません
          </p>
        ) : (
          <ul className="space-y-2">
            {(progressList ?? []).map((p) => {
              const phrase = p.phrases as {
                id: string;
                phrase_en: string;
                source_title_ja: string;
              } | null;
              if (!phrase) return null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/phrase/${phrase.id}`}
                    className="flex items-center justify-between rounded-xl bg-surface p-3 shadow-sm ring-1 ring-border transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">
                        {phrase.phrase_en}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {phrase.source_title_ja}
                      </p>
                    </div>
                    <span className="ml-2 text-xs text-text-secondary">
                      {new Date(p.completed_at).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
