"use client";

import React, { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  {
    href: "/today",
    label: "今日のフレーズ",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 ${active ? "text-primary" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "学習履歴",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 ${active ? "text-primary" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
      </svg>
    ),
  },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const handleTabClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (pathname.startsWith(href)) return;
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  // トランジション完了したらpendingをクリア
  React.useEffect(() => {
    if (!isPending) setPendingHref(null);
  }, [isPending]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface pb-safe">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const isActive = pendingHref
            ? tab.href === pendingHref
            : pathname.startsWith(tab.href);
          return (
            <a
              key={tab.href}
              href={tab.href}
              onClick={(e) => handleTabClick(e, tab.href)}
              className="flex flex-1 flex-col items-center gap-1 py-2"
            >
              {tab.icon(isActive)}
              <span
                className={`text-xs ${
                  isActive ? "font-medium text-primary" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
