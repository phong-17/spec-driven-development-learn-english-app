"use client";

import { motion } from "motion/react";

import type { HeroContent } from "@/features/home/content";
import { TypingCat } from "@/features/home/components/TypingCat";
import { useInfiniteTypewriter } from "@/features/home/hooks/useInfiniteTypewriter";

const DASHES = 95;

export function HeroSection({ eyebrow, title, tagline }: HeroContent) {
  const displayed = useInfiniteTypewriter(title, true);

  return (
    <section
      aria-label="Hero"
      className="w-full border-b border-dashed border-foreground/30 px-4 py-14 md:px-8 md:py-24"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="font-mono text-xs text-accent md:text-sm"
        >
          {eyebrow}
        </motion.p>

        {/* Top frame */}
        <motion.p
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          style={{ originX: 0 }}
          className="select-none overflow-hidden whitespace-nowrap font-mono text-xs text-foreground/35 md:text-sm"
        >
          {"┌" + "─".repeat(DASHES) + "┐"}
        </motion.p>

        {/* Title row: cat on left + typewriter */}
        <div className="flex items-end gap-4 px-3">
          <div className="shrink-0">
            <TypingCat />
          </div>
          <h1 className="break-words font-mono text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {displayed}
            <motion.span
              aria-hidden
              className="text-accent"
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            >
              _
            </motion.span>
          </h1>
        </div>

        {/* Bottom frame */}
        <motion.p
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          style={{ originX: 0 }}
          className="select-none overflow-hidden whitespace-nowrap font-mono text-xs text-foreground/35 md:text-sm"
        >
          {"└" + "─".repeat(DASHES) + "┘"}
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="max-w-2xl font-mono text-sm text-foreground/65 md:text-base"
        >
          {tagline}
        </motion.p>
      </div>
    </section>
  );
}
