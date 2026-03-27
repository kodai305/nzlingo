"use client";

import { createClient } from "@/lib/supabase/client";

export default function UnauthorizedPage() {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          アクセスが許可されていません
        </h1>
        <p className="mt-3 text-gray-600">
          このアプリは招待されたユーザーのみ利用できます。
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 rounded-xl bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
