"use client";

import { useState } from "react";
import type { VocabularyItem } from "@/lib/types/database";

interface ExplanationProps {
  summary: string;
  vocabulary: VocabularyItem[];
  usage: string;
  grammar: string;
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-text"
      >
        {title}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <div className="pb-3 text-sm text-text-secondary">{children}</div>}
    </div>
  );
}

export function ExplanationSection({
  summary,
  vocabulary,
  usage,
  grammar,
}: ExplanationProps) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
      <Section title="解説" defaultOpen>
        <p>{summary}</p>
      </Section>

      {vocabulary.length > 0 && (
        <Section title="単語・表現">
          <ul className="space-y-2">
            {vocabulary.map((v) => (
              <li key={v.word}>
                <span className="font-medium text-text">{v.word}</span>
                <span className="mx-1">—</span>
                <span>{v.meaning}</span>
                {v.note && (
                  <p className="mt-0.5 text-xs text-gray-400">{v.note}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="使える場面">
        <p>{usage}</p>
      </Section>

      <Section title="文法ポイント">
        <p>{grammar}</p>
      </Section>
    </div>
  );
}
