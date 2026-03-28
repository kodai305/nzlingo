export default function HistoryLoading() {
  return (
    <main className="mx-auto max-w-lg p-4">
      <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-24 animate-pulse rounded-xl bg-gradient-to-r from-indigo-200 to-purple-200" />
      <div className="mt-4 h-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="mt-6 space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-gray-100"
          />
        ))}
      </div>
    </main>
  );
}
