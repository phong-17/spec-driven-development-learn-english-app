"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function BackgroundSection() {
  return (
    <motion.section
      aria-label="Background illustration"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full border-b border-dashed border-foreground/30"
    >
      <div className="relative h-[400px] w-full overflow-hidden">
        <Image
          src="/images/background.gif"
          alt="ASCII art — a cat holds an umbrella in the rain beside street lamps"
          fill
          className="object-contain dark:invert"
          unoptimized
          priority
        />
      </div>
    </motion.section>
  );
}
