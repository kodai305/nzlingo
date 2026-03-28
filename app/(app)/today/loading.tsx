export default function TodayLoading() {
  return (
    <main className="pt-2">
      <div className="mb-2 px-4">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-5 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mx-auto max-w-lg space-y-5 p-4">
        <div className="aspect-[16/9] animate-pulse rounded-2xl bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
        <div className="space-y-3 rounded-xl bg-gray-50 p-4">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
