import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";

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

  // ホワイトリストチェック
  const { data: allowed } = await supabase
    .from("allowed_users")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!allowed) {
    redirect("/unauthorized");
  }

  return (
    <div className="pb-20">
      {children}
      <NavBar />
    </div>
  );
}
