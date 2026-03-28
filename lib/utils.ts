const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const USE_SUPABASE_STORAGE = process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE === "true";

const LAUNCH_DATE_JST = new Date("2026-03-27T00:00:00+09:00");
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * UTCのDateをJSTの日付（0時0分0秒）に変換
 */
function toJSTDate(date: Date): Date {
  const jst = new Date(date.getTime() + JST_OFFSET_MS);
  jst.setUTCHours(0, 0, 0, 0);
  return jst;
}

/**
 * 現在のJST日付を取得
 */
function nowJST(): Date {
  return toJSTDate(new Date());
}

/**
 * アセットURLを生成
 */
export function getAssetUrl(path: string | null): string | null {
  if (!path) return null;
  if (USE_SUPABASE_STORAGE) {
    return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
  }
  return `/${path}`;
}

/**
 * 今日のフレーズのdisplay_orderを計算（JST基準）
 */
export function getTodayDisplayOrder(totalPhrases: number): number {
  const todayJST = nowJST();
  const launchJST = toJSTDate(LAUNCH_DATE_JST);
  const diffDays = Math.floor(
    (todayJST.getTime() - launchJST.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) return 1;
  return (diffDays % totalPhrases) + 1;
}

/**
 * 連続学習日数を計算（JST基準）
 */
export function calculateStreak(completedDates: Date[]): number {
  if (completedDates.length === 0) return 0;

  const todayJST = nowJST();

  // 各完了日をJST日付に変換してユニーク化・降順ソート
  const uniqueDays = [
    ...new Set(
      completedDates.map((d) => toJSTDate(new Date(d)).getTime())
    ),
  ].sort((a, b) => b - a);

  const oneDay = 1000 * 60 * 60 * 24;

  // 今日もしくは昨日から始まっているかチェック
  const latest = uniqueDays[0];
  if (todayJST.getTime() - latest > oneDay) return 0;

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
