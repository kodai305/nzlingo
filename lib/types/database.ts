export interface Phrase {
  id: string;
  phrase_en: string;
  phrase_ja: string;
  source_title: string;
  source_title_ja: string;
  source_character: string;
  source_year: number;
  genre: string;
  image_url: string;
  audio_url: string;
  explanation_summary: string;
  explanation_vocabulary: VocabularyItem[];
  explanation_usage: string;
  explanation_grammar: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  display_order: number;
  created_at: string;
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  note: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  phrase_id: string;
  completed_at: string;
}

export interface AllowedUser {
  id: string;
  email: string;
  created_at: string;
}
