// Renders Arabic text to a PNG card in the Amiri font, at request time,
// inside the Worker. Node/offline equivalent: scripts/render-arabic.ts
// (used to pre-render the fixed set of /doa cards); this one backs /quran
// and the daily verse job, which can reference any of the ~6,200 ayat and
// so can't be pre-rendered ahead of time.
import { Buffer } from "node:buffer";
import * as fontkit from "fontkit";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import fontData from "../../fonts/Amiri-Regular.ttf";
import { buildArabicCardSvg } from "./arabicCardBuilder";

const fontBytes = new Uint8Array(fontData);
// A single .ttf always opens as a Font, never a FontCollection.
const font = fontkit.create(Buffer.from(fontBytes)) as fontkit.Font;

let wasmReady: Promise<void> | undefined;
function ensureWasmInit(): Promise<void> {
  wasmReady ??= initWasm(wasmModule);
  return wasmReady;
}

export async function renderArabicCard(arabicText: string): Promise<Uint8Array> {
  await ensureWasmInit();
  const svg = buildArabicCardSvg(font, arabicText);
  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [fontBytes],
      loadSystemFonts: false,
      defaultFontFamily: "Amiri",
    },
  });
  return resvg.render().asPng();
}
