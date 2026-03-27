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
      // 停止
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      setIsPlaying(false);
      return;
    }

    // 音声ファイルがある場合はそちらを優先
    if (src && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch {
        // 音声ファイルの再生に失敗した場合、Web Speech APIにフォールバック
      }
    }

    // Web Speech API でフォールバック
    speakWithTTS();
  };

  const handleEnded = () => setIsPlaying(false);

  return (
    <>
      {src && (
        <audio ref={audioRef} src={src} onEnded={handleEnded} preload="auto" />
      )}
      <button
        onClick={togglePlay}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all active:scale-95"
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
    </>
  );
}
