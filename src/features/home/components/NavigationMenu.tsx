"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import type { NavLink } from "@/features/home/content";

type NavigationMenuProps = {
  links: ReadonlyArray<NavLink>;
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.2 + i * 0.12, duration: 0.35 },
  }),
};

export function NavigationMenu({ links }: NavigationMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Primary"
      className="
        relative w-full border-b border-dashed border-foreground/30
        lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r lg:border-dashed
        lg:sticky lg:top-0 lg:flex lg:h-auto lg:flex-col lg:items-start
        lg:gap-3 lg:overflow-y-auto lg:px-5 lg:py-8
      "
    >
      {/* ── Top bar (< lg) ── */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <Link href={"/"} className="font-mono text-xs text-accent">
          {">"} ~/learn-english
        </Link>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="group relative overflow-hidden border border-dashed border-foreground/40 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {open ? "[ × CLOSE ]" : "[ ≡ MENU ]"}
        </button>
      </div>

      {/* ── Dropdown (< lg, toggle) ── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            key="dropdown"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-50 border-b border-dashed border-foreground/30 bg-background px-4 py-3 lg:hidden"
          >
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-1.5 py-2 font-mono text-sm text-foreground/60 transition-colors hover:text-accent"
                >
                  <span className="shrink-0 text-accent/70 transition-colors group-hover:text-accent">
                    ▸
                  </span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="fixed top-[2%]">
        {/* ── Sidebar header (lg+) ── */}
        <Link href={"/"} className="hidden w-full lg:block">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs text-accent"
          >
            {">"} ~/learn-english
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-1 font-mono text-sm font-bold uppercase tracking-widest text-foreground"
          >
            LEARN ENGLISH
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            style={{ originX: 0 }}
            className="mt-3 border-t border-dashed border-foreground/30"
          />
        </Link>

        {/* ── Sidebar nav items (lg+) ── */}
        <ul className="mt-2 hidden flex-col gap-2 lg:flex">
          {links.map((link, i) => (
            <motion.li
              key={link.href}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              <Link
                href={link.href}
                className="group flex items-start gap-1.5 font-mono text-sm text-foreground/60 transition-colors hover:text-accent"
              >
                <span className="shrink-0 text-accent/70 transition-colors group-hover:text-accent">
                  ▸
                </span>
                <span>{link.label}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
