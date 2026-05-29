"use client";

type QuizSummaryProps = {
  correct: number;
  wrong: number;
  total: number;
  elapsedMs: number;
  onRestart: () => void;
  /** Labels for the two count rows; defaults to CORRECT / WRONG. */
  correctLabel?: string;
  wrongLabel?: string;
};

function formatElapsed(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const ROBOT_ASCII = `
      / \\__/,|   (\`\\
_.| o  o |_   ) )
 -(((---(((--------
`.trim();

export function QuizSummary({
  correct,
  wrong,
  total,
  elapsedMs,
  onRestart,
  correctLabel = "CORRECT",
  wrongLabel = "WRONG",
}: QuizSummaryProps) {
  return (
    <div className="flex flex-col gap-3 border border-dashed border-accent/60 px-4 py-6 font-mono text-base text-foreground/80">
      <pre
        aria-hidden
        className="select-none text-center text-xs leading-tight text-green-500"
      >
        {ROBOT_ASCII}
      </pre>
      <p className="text-center text-sm uppercase tracking-widest text-accent">
        [ SESSION COMPLETE ]
      </p>
      <dl className="mx-auto flex w-full max-w-xs flex-col gap-1">
        <div className="flex justify-between">
          <dt>{correctLabel}</dt>
          <dd className="text-accent">{correct}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{wrongLabel}</dt>
          <dd className="text-foreground/60">{wrong}</dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-foreground/20 pt-1">
          <dt>TOTAL</dt>
          <dd>{total}</dd>
        </div>
        <div className="flex justify-between">
          <dt>TIME</dt>
          <dd>{formatElapsed(elapsedMs)}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={onRestart}
        className="mx-auto border border-dashed border-foreground/40 px-4 py-1.5 text-sm uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        [ RESTART ]
      </button>
    </div>
  );
}
