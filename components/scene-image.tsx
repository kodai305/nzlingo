"use client";

import Image from "next/image";
import { useState } from "react";

const genreGradients: Record<string, string> = {
  romance: "from-pink-400 to-rose-300",
  action: "from-orange-400 to-red-400",
  comedy: "from-yellow-300 to-amber-300",
  drama: "from-blue-400 to-indigo-400",
  "sci-fi": "from-cyan-400 to-blue-500",
  animation: "from-emerald-400 to-teal-400",
  thriller: "from-gray-600 to-gray-800",
  fantasy: "from-purple-400 to-violet-500",
  horror: "from-gray-800 to-black",
};

const genreEmojis: Record<string, string> = {
  romance: "💕",
  action: "💥",
  comedy: "😂",
  drama: "🎭",
  "sci-fi": "🚀",
  animation: "✨",
  thriller: "🔪",
  fantasy: "🧙",
  horror: "👻",
};

export function SceneImage({
  src,
  alt,
  genre,
  genreLabel,
}: {
  src: string | null;
  alt: string;
  genre: string;
  genreLabel: string;
}) {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !src || imgError;
  const gradient = genreGradients[genre] ?? "from-gray-400 to-gray-500";
  const emoji = genreEmojis[genre] ?? "🎬";

  if (showPlaceholder) {
    return (
      <div
        className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}`}
      >
        <div className="text-center text-white">
          <span className="text-5xl">{emoji}</span>
          <p className="mt-2 text-sm font-medium opacity-80">{genreLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        onError={() => setImgError(true)}
      />
    </div>
  );
}
