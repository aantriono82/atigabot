// Renders Arabic text to a PNG card using the Amiri font, since Telegram
// text messages cannot specify a custom font family. Text shaping/ligatures
// are handled by resvg (usvg + rustybuzz); word wrapping is computed
// ourselves via fontkit glyph-advance measurements, since resvg's plain SVG
// <text> does not wrap. This is the Node/offline counterpart to
// src/lib/arabicCard.ts, which does the same thing at request time inside
// the Worker via @resvg/resvg-wasm.
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import { Resvg } from "@resvg/resvg-js";
import { buildArabicCardSvg } from "../src/lib/arabicCardBuilder";

const FONT_PATH = fileURLToPath(new URL("../fonts/Amiri-Regular.ttf", import.meta.url));
// A single .ttf always opens as a Font, never a FontCollection.
const font = fontkit.openSync(FONT_PATH) as fontkit.Font;

export function renderArabicCard(arabicText: string): Buffer {
  const svg = buildArabicCardSvg(font, arabicText);
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [FONT_PATH],
      loadSystemFonts: false,
      defaultFontFamily: "Amiri",
    },
  });
  return resvg.render().asPng();
}
