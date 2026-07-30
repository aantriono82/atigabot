// Builds the SVG markup for an Arabic-text card in the Amiri font. Pure text
// layout only (measurement, word-wrapping, XML escaping) so it can run both
// in Node (scripts/render-arabic.ts, via @resvg/resvg-js) and in the Workers
// runtime (src/lib/arabicCard.ts, via @resvg/resvg-wasm) — only the font
// loading and rasterization differ between those two.
import type * as fontkit from "fontkit";

const FONT_SIZE = 42;
const LINE_HEIGHT = FONT_SIZE * 1.9;
const CARD_WIDTH = 1000;
const PADDING_X = 60;
const PADDING_Y = 50;

function measure(font: fontkit.Font, text: string): number {
  return (font.layout(text).advanceWidth / font.unitsPerEm) * FONT_SIZE;
}

function wrapParagraph(font: fontkit.Font, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(font, candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Wraps text into lines, treating "\n" in the input as an explicit paragraph
 * break (e.g. between ayat joined for a multi-verse card) rather than just
 * more whitespace to wrap around. */
function wrapText(font: fontkit.Font, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      lines.push("");
    } else {
      lines.push(...wrapParagraph(font, paragraph, maxWidth));
    }
  }
  return lines;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildArabicCardSvg(font: fontkit.Font, arabicText: string): string {
  const maxWidth = CARD_WIDTH - PADDING_X * 2;
  const lines = wrapText(font, arabicText, maxWidth);
  const height = lines.length * LINE_HEIGHT + PADDING_Y * 2;

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${CARD_WIDTH / 2}" y="${PADDING_Y + FONT_SIZE + i * LINE_HEIGHT}">${escapeXml(
          line,
        )}</tspan>`,
    )
    .join("\n");

  return `<svg width="${CARD_WIDTH}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CARD_WIDTH}" height="${height}" fill="#ffffff"/>
  <text font-family="Amiri" font-size="${FONT_SIZE}" fill="#0a0a0a" text-anchor="middle" direction="rtl">${tspans}</text>
</svg>`;
}
