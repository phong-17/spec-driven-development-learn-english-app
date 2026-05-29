import Image from "next/image";

import type { PageImage } from "@/types/lesson";

type PdfPageImageProps = {
  image: PageImage;
};

/**
 * Renders an image extracted from the source PDF. The book pages are raster
 * charts/tables, so we display them at their intrinsic size (never upscaled)
 * and let them shrink to fit narrow viewports.
 */
export function PdfPageImage({ image }: PdfPageImageProps) {
  return (
    <figure className="flex flex-col gap-1">
      <div
        className="w-full border border-dashed border-foreground/30 bg-white p-1"
        style={{ maxWidth: image.width }}
      >
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
      <figcaption className="font-mono text-xs text-foreground/40">
        {image.alt}
      </figcaption>
    </figure>
  );
}
