import { createClient } from "@/lib/supabase/server";
import { getTodayDisplayOrder } from "@/lib/utils";
import { PhraseCard } from "@/components/phrase-card";
import type { Phrase } from "@/lib/types/database";

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

  return (
    <main className="pt-2">
      <div className="mb-2 px-4">
        <h1 className="text-lg font-bold text-text">今日のフレーズ</h1>
      </div>
      <PhraseCard
        phrase={phrase as Phrase}
        isCompleted={!!progress}
      />
    </main>
  );
}
