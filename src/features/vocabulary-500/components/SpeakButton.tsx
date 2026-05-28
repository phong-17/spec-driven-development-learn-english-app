"use client";

function speak(word: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = "en-US";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

export function SpeakButton({ word }: { word: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(word);
      }}
      aria-label={`Speak "${word}"`}
      className="border border-dashed border-foreground/30 px-1.5 py-0.5 font-mono text-sm leading-none text-foreground/50 transition-colors hover:border-accent hover:text-accent"
    >
      ▶
    </button>
  );
}
