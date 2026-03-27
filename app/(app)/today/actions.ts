"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markPhraseComplete(phraseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      phrase_id: phraseId,
    },
    { onConflict: "user_id,phrase_id" }
  );

  revalidatePath("/today");
  revalidatePath("/history");
}
