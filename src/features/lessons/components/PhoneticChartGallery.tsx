import type { PageImage } from "@/types/lesson";

import { PdfPageImage } from "./PdfPageImage";

type PhoneticChartGalleryProps = {
  charts: ReadonlyArray<PageImage>;
};

export function PhoneticChartGallery({ charts }: PhoneticChartGalleryProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-sm uppercase tracking-wider text-accent">
        ── PHONETICS REFERENCE · PART 1 CHARTS ──
      </h2>
      <p className="font-mono text-sm text-foreground/50">
        Bảng phiên âm quốc tế tổng quát từ phần đầu sách (ảnh gốc, giữ nguyên).
      </p>

      <div className="flex flex-col gap-4">
        {charts.map((chart) => (
          <PdfPageImage key={chart.src} image={chart} />
        ))}
      </div>
    </section>
  );
}
