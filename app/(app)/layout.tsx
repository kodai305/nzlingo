import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ホワイトリストチェック（cookieで結果をキャッシュして毎回DBを叩かない）
  const cookieStore = await cookies();
  const allowedCookie = cookieStore.get("nzlingo_allowed");

  if (!allowedCookie || allowedCookie.value !== user.id) {
    const { data: allowed } = await supabase
      .from("allowed_users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!allowed) {
      redirect("/unauthorized");
    }

    // 検証済みフラグをcookieにセット（24時間有効）
    cookieStore.set("nzlingo_allowed", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
  }

  return (
    <div className="pb-20">
      {children}
      <NavBar />
    </div>
  );
}
