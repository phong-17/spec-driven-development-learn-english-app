"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import type { SectionContent } from "@/features/home/content";
import { TypingCat } from "@/features/home/components/TypingCat";
import { useInfiniteTypewriter } from "@/features/home/hooks/useInfiniteTypewriter";

const CAT_HEAD = "    ∧_∧    \n  (=^ω^=)  ";

export function ContentSection({
  id,
  title,
  description,
  href,
  buttonLabel,
}: SectionContent) {
  const [hovered, setHovered] = useState(false);
  const displayedDesc = useInfiniteTypewriter(description, hovered);

  return (
    <section
      id={id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full px-4 py-10 md:px-8 md:py-14"
    >
      <div
        className={`mx-auto flex w-full max-w-4xl items-end gap-6 border border-dashed p-6 transition-colors duration-300 md:gap-10 md:p-10 ${
          hovered ? "border-green-400" : "border-foreground/30"
        }`}
      >
        {/* Left full cat — lg+ only */}
        <div className="hidden shrink-0 lg:block">
          <TypingCat />
        </div>

        {/* Right: label + title + description + button */}
        <div className="flex flex-1 flex-col gap-4">
          <p aria-hidden className="font-mono text-xs text-foreground/35">
            {`[ section // ${id} ]`}
          </p>

          <h2 className="break-words font-mono text-2xl font-bold uppercase tracking-tight text-accent md:text-4xl">
            {title}
          </h2>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
            {/* Fixed-height description — invisible spacer prevents layout shift */}
            <div className="relative max-w-lg">
              <p
                aria-hidden
                className="invisible font-mono text-sm leading-relaxed md:text-base"
              >
                {description}
              </p>
              <p className="absolute inset-0 font-mono text-sm leading-relaxed text-foreground/75 md:text-base">
                {hovered ? displayedDesc : description}
                {hovered && (
                  <motion.span
                    aria-hidden
                    className="text-accent"
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    _
                  </motion.span>
                )}
              </p>
            </div>

            {/* Button + cat head (md only) */}
            <div className="flex shrink-0 items-end gap-3 self-start sm:self-end md:items-center">
              {/* Cat head — md only, hidden at lg+ */}
              <pre
                aria-hidden
                className="hidden select-none font-mono text-xs leading-snug text-green-400 md:block lg:hidden"
              >
                {CAT_HEAD}
              </pre>

              <Link href={href} aria-label={`Open ${title}`} className="group">
                <motion.span
                  className="relative block overflow-hidden border border-dashed border-accent px-5 py-2 font-mono text-xs uppercase tracking-wider text-accent sm:text-sm"
                  whileHover="hover"
                  initial="rest"
                >
                  <motion.span
                    aria-hidden
                    variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                    transition={{ duration: 0.2 }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-accent"
                  />
                  <span className="relative z-10 transition-colors duration-150 group-hover:text-background">
                    {`[ ${buttonLabel} ]`}
                  </span>
                </motion.span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
