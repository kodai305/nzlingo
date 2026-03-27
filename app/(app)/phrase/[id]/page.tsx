import { createClient } from "@/lib/supabase/server";
import { PhraseCard } from "@/components/phrase-card";
import { notFound } from "next/navigation";
import type { Phrase } from "@/lib/types/database";

export default async function PhraseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: phrase } = await supabase
    .from("phrases")
    .select("*")
    .eq("id", id)
    .single();

  if (!phrase) notFound();

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
        <h1 className="text-lg font-bold text-text">フレーズ復習</h1>
      </div>
      <PhraseCard phrase={phrase as Phrase} isCompleted={!!progress} />
    </main>
  );
}
