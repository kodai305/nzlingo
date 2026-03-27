"use client";

const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export function ProgressCalendar({
  completedDates,
}: {
  completedDates: Date[];
}) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const completedSet = new Set(
    completedDates.map((d) => {
      const date = new Date(d);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );

  const isCompleted = (day: number) =>
    completedSet.has(`${year}-${month}-${day}`);

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
      <p className="mb-3 text-center text-sm font-medium text-text">
        {year}年{month + 1}月
      </p>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="py-1 text-text-secondary">
            {d}
          </div>
        ))}

        {/* 月初の空白 */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* 日付 */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const completed = isCompleted(day);
          const todayClass = isToday(day);
          return (
            <div
              key={day}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs mx-auto ${
                completed
                  ? "bg-primary text-white font-medium"
                  : todayClass
                    ? "ring-2 ring-primary text-primary font-medium"
                    : "text-text-secondary"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
