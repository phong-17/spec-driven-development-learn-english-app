"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export type SessionOption = {
  session: number;
  label: string;
  count?: number;
};

type SessionDropdownProps = {
  options: ReadonlyArray<SessionOption>;
  selected: number;
  onChange: (session: number) => void;
};

export function SessionDropdown({
  options,
  selected,
  onChange,
}: SessionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.session === selected),
    ),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listboxId = useId();

  const selectedLabel =
    options.find((o) => o.session === selected)?.label ?? `Day ${selected}`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function openDropdown() {
    const idx = Math.max(
      0,
      options.findIndex((o) => o.session === selected),
    );
    setFocusedIndex(idx);
    setOpen(true);
    requestAnimationFrame(() => {
      optionRefs.current[idx]?.focus();
    });
  }

  function selectAt(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.session);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDropdown();
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(options.length - 1, focusedIndex + 1);
      setFocusedIndex(next);
      optionRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(0, focusedIndex - 1);
      setFocusedIndex(next);
      optionRefs.current[next]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectAt(focusedIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
      optionRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = options.length - 1;
      setFocusedIndex(last);
      optionRefs.current[last]?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={onTriggerKeyDown}
        className="border border-dashed border-foreground/40 px-3 py-1.5 font-mono text-sm uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        {`[ ${selectedLabel} ${open ? "▴" : "▾"} ]`}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-40 mt-1 w-44 border border-dashed border-foreground/40 bg-background"
          >
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Select session"
              tabIndex={-1}
              onKeyDown={onListKeyDown}
              className="scrollbar-hide max-h-72 overflow-y-auto py-1"
            >
              {options.map((option, index) => {
                const isSelected = option.session === selected;
                return (
                  <li
                    key={option.session}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={index === focusedIndex ? 0 : -1}
                    onClick={() => selectAt(index)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`flex cursor-pointer items-center gap-1 px-3 py-1 font-mono text-sm transition-colors focus:outline-none ${
                      isSelected
                        ? "text-accent"
                        : "text-foreground/80 hover:text-accent focus:text-accent"
                    }`}
                  >
                    <span className="text-accent/70">
                      {isSelected ? "▸" : " "}
                    </span>
                    <span>{option.label}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
