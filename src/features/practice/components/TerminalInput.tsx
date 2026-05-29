"use client";

import { useEffect, useRef } from "react";

type TerminalInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

/**
 * Terminal-window styled input. Looks like a mini CLI prompt:
 *
 *   ┌─ ANSWER ─────────────────────────────────┐
 *   │                                           │
 *   │  > _                                      │
 *   │                                           │
 *   └───────────────────────────────────────────┘
 *
 * Submit is Enter-only — no button. The native text caret provides the
 * blinking cursor; no custom animation needed.
 */
export function TerminalInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  autoFocus = true,
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && autoFocus) {
      inputRef.current?.focus();
    }
  }, [disabled, autoFocus]);

  return (
    <div className="flex flex-col font-mono text-base">
      {/* Title bar */}
      <div className="flex items-center gap-2 border border-dashed border-foreground/50 px-3 py-1 text-xs uppercase tracking-widest text-foreground/50">
        <span>┌─</span>
        <span>ANSWER</span>
        <span className="flex-1 overflow-hidden">
          {"─".repeat(80)}
        </span>
        <span>─┐</span>
      </div>

      {/* Input area — label wraps so clicking anywhere focuses the input */}
      <label className="flex min-h-20 cursor-text flex-col justify-center gap-1 border-x border-dashed border-foreground/50 bg-background px-4 py-4 focus-within:border-accent">
        <div className="flex items-center gap-2">
          <span className="select-none text-accent">{">"}</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Type the English word"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            className="w-full bg-transparent text-xl text-foreground caret-accent outline-none placeholder:text-foreground/25 disabled:opacity-50"
            placeholder="type here and press Enter…"
          />
        </div>
        <p className="pl-5 text-xs text-foreground/30">
          {disabled ? "[ SUBMITTED ]" : "Press Enter to submit"}
        </p>
      </label>

      {/* Bottom bar */}
      <div className="flex items-center border border-dashed border-foreground/50 px-3 py-1 text-xs text-foreground/30">
        <span>└</span>
        <span className="flex-1 overflow-hidden">
          {"─".repeat(80)}
        </span>
        <span>┘</span>
      </div>
    </div>
  );
}
