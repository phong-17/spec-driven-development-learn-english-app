import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
import type { SoundChart } from "@/types/lesson";

type SoundChartsProps = {
  charts: ReadonlyArray<SoundChart>;
};

export function SoundCharts({ charts }: SoundChartsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono text-sm uppercase tracking-wider text-accent">
        ── SOUND CHARTS · TAP ▶ TO HEAR ──
      </h2>

      {charts.map((chart) => (
        <div key={chart.id} className="flex flex-col gap-2">
          <h3 className="border-b border-dashed border-accent/50 pb-1 font-mono text-sm uppercase tracking-wider text-accent">
            {`── ${chart.titleVi} (${chart.titleEn}) · ${chart.sounds.length} ──`}
          </h3>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {chart.sounds.map((sound) => (
              <li
                key={sound.symbol}
                className="flex items-center gap-2 border border-dashed border-foreground/30 px-2 py-1.5 font-mono text-base text-foreground/80"
              >
                <span className="font-bold text-foreground">{sound.symbol}</span>
                {sound.phonetic ? (
                  <span className="text-foreground/60">{sound.phonetic}</span>
                ) : null}
                {sound.word && sound.word !== sound.symbol ? (
                  <span className="text-foreground/50">{sound.word}</span>
                ) : null}
                <span className="ml-auto">
                  <SpeakButton word={sound.word} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
