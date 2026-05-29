// Extract embedded full-page images from the Ms. Huong PDF to PNG files.
// Run with: pnpm tsx scripts/extract-lesson-images.ts [page ...]
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

const PDF_PATH = path.resolve("Sach_Tieng_Anh_Ms_Huong_Thiet_Ke.pdf");
const OUT_DIR = path.resolve("scripts/_pdf-images");

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Encode RGB (kind 2) or RGBA (kind 3) or grayscale (kind 1) to PNG.
function encodePNG(width: number, height: number, kind: number, data: Uint8Array): Buffer {
  let channels: number;
  let colorType: number;
  if (kind === 2) {
    channels = 3;
    colorType = 2;
  } else if (kind === 3) {
    channels = 4;
    colorType = 6;
  } else {
    channels = 1;
    colorType = 0;
  }
  const stride = width * channels;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(data.buffer, data.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1,
    );
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await pdfjs.getDocument({ data }).promise;

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const argPages = process.argv.slice(2).map((n) => parseInt(n, 10)).filter(Boolean);
  const pages = argPages.length
    ? argPages
    : Array.from({ length: doc.numPages }, (_, i) => i + 1);

  for (const pageNum of pages) {
    const page = await doc.getPage(pageNum);
    const opList = await page.getOperatorList();
    const names: string[] = [];
    for (let i = 0; i < opList.fnArray.length; i++) {
      if (
        opList.fnArray[i] === pdfjs.OPS.paintImageXObject ||
        opList.fnArray[i] === pdfjs.OPS.paintImageMaskXObject
      ) {
        names.push(opList.argsArray[i][0]);
      }
    }
    let idx = 0;
    for (const name of names) {
      type DecodedImage = {
        width: number;
        height: number;
        kind: number;
        data?: Uint8Array;
      } | null;
      const img = await new Promise<DecodedImage>((resolve) => {
        let done = false;
        const t = setTimeout(() => {
          if (!done) resolve(null);
        }, 8000);
        try {
          page.objs.get(name, (v: DecodedImage) => {
            done = true;
            clearTimeout(t);
            resolve(v);
          });
        } catch {
          clearTimeout(t);
          resolve(null);
        }
      });
      if (!img || !img.data) {
        console.log(`  page ${pageNum} ${name}: <unresolved, skipped>`);
        continue;
      }
      idx++;
      const png = encodePNG(img.width, img.height, img.kind, img.data);
      const out = path.join(
        OUT_DIR,
        `page-${String(pageNum).padStart(2, "0")}-${idx}.png`,
      );
      fs.writeFileSync(out, png);
      console.log(`wrote ${out} (${img.width}x${img.height} kind=${img.kind})`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
