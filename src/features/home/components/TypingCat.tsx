"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const FRAMES: string[][] = [
  [
    "    ∧_∧    ",
    "  (=^ω^=)  ",
    "   (つ っ)  ",
    " ╔══════╗  ",
    " ║▒▒▒▒▒▒║  ",
    " ╚══════╝  ",
  ],
  [
    "    ∧_∧    ",
    "  (=^ω^=)  ",
    "   (っ づ)  ",
    " ╔══════╗  ",
    " ║▒▒▒▒▒▒║  ",
    " ╚══════╝  ",
  ],
];

const TYPING_DOTS = ["typing.  ", "typing.. ", "typing..."];

export function TypingCat() {
  const [frame, setFrame] = useState(0);
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
      setDotIdx((d) => (d + 1) % TYPING_DOTS.length);
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex select-none items-end gap-0"
    >
      <pre className="font-mono text-xs leading-snug text-green-400">
        {FRAMES[frame].join("\n")}
      </pre>
      {/* Fixed width prevents layout shift as dots change length */}
      <span className="mb-1 inline-block w-20 shrink-0 font-mono text-xs text-accent/60">
        {">"} {TYPING_DOTS[dotIdx]}
      </span>
    </motion.div>
  );
}
