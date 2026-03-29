"use client";

import { useRef, useState, useCallback } from "react";

export function AudioPlayer({
  src,
  text,
}: {
  src: string | null;
  text: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const speakWithTTS = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text]);

  const togglePlay = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (src && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch {
        // フォールバック
      }
    }

    speakWithTTS();
  };

  const handleEnded = () => setIsPlaying(false);

  return (
    <div className="flex flex-col items-center gap-2">
      {src && (
        <audio ref={audioRef} src={src} onEnded={handleEnded} preload="auto" />
      )}

      {/* ボタン + パルス */}
      <div className="relative">
        {isPlaying && (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        )}
        <button
          onClick={togglePlay}
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 ${
            isPlaying ? "bg-primary-dark" : "bg-primary"
          }`}
          aria-label={isPlaying ? "一時停止" : "再生"}
        >
          {isPlaying ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* サウンドバー */}
      {isPlaying && (
        <div className="flex items-end gap-[3px] h-5">
          <span className="w-[3px] rounded-full bg-primary animate-soundbar-1" />
          <span className="w-[3px] rounded-full bg-primary/70 animate-soundbar-2" />
          <span className="w-[3px] rounded-full bg-primary/50 animate-soundbar-3" />
        </div>
      )}
    </div>
  );
}
