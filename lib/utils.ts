const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const USE_SUPABASE_STORAGE = process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE === "true";

const LAUNCH_DATE = new Date("2026-03-27T00:00:00+09:00");

/**
 * アセットURLを生成
 * - ローカル開発: public/ 配下から直接配信 → "/{path}" (例: "/images/phrases/phrase_001.webp")
 * - 本番 (Supabase Storage): "{SUPABASE_URL}/storage/v1/object/public/{path}"
 *
 * @param path - DBに保存されたパス (例: "images/phrases/phrase_001.webp")
 */
export function getAssetUrl(path: string | null): string | null {
  if (!path) return null;
  if (USE_SUPABASE_STORAGE) {
    return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
  }
  return `/${path}`;
}

export function getTodayDisplayOrder(totalPhrases: number): number {
  const now = new Date();
  const diffMs = now.getTime() - LAUNCH_DATE.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // ローンチ前はdisplay_order 1を返す
  if (diffDays < 0) return 1;
  return (diffDays % totalPhrases) + 1;
}

export function calculateStreak(completedDates: Date[]): number {
  if (completedDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 日付をユニークにしてソート（降順）
  const uniqueDays = [
    ...new Set(
      completedDates.map((d) => {
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        return day.getTime();
      })
    ),
  ].sort((a, b) => b - a);

  const oneDay = 1000 * 60 * 60 * 24;

  // 今日もしくは昨日から始まっているかチェック
  const latest = uniqueDays[0];
  if (today.getTime() - latest > oneDay) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === oneDay) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
