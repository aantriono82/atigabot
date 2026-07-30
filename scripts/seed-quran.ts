// One-time seed script: fetches the full Qur'an corpus (Arabic text, Indonesian
// translation, Kemenag tafsir) from equran.id and writes a SQL file with INSERT
// statements for the `ayat` table. Run once, then apply with:
//   wrangler d1 execute atigabot-db --local --file=./seed/quran.sql
//   wrangler d1 execute atigabot-db --remote --file=./seed/quran.sql
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://equran.id/api/v2";
// D1 rejects single SQL statements over ~100,000 bytes (SQLITE_TOOBIG),
// measured in UTF-8 bytes, not JS string length (Arabic text is 2 bytes/char
// in UTF-8 but 1 UTF-16 code unit in JS). Chunk by accumulated UTF-8 byte
// size, with headroom under the 100KB wall.
const MAX_STATEMENT_BYTES = 80_000;
const CONCURRENCY = 5;

interface SuratListEntry {
  nomor: number;
}

interface AyatEntry {
  nomorAyat: number;
  teksArab: string;
  teksIndonesia: string;
}

interface SuratDetail {
  data: {
    nomor: number;
    namaLatin: string;
    ayat: AyatEntry[];
  };
}

interface TafsirEntry {
  ayat: number;
  teks: string;
}

interface TafsirDetail {
  data: {
    tafsir: TafsirEntry[];
  };
}

interface Row {
  surah: number;
  surahNameLatin: string;
  ayat: number;
  arabic: string;
  translation: string;
  tafsir: string;
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchSurah(nomor: number): Promise<Row[]> {
  const [surat, tafsir] = await Promise.all([
    fetchJson<SuratDetail>(`${BASE}/surat/${nomor}`),
    fetchJson<TafsirDetail>(`${BASE}/tafsir/${nomor}`),
  ]);

  const tafsirByAyat = new Map<number, string>();
  for (const t of tafsir.data.tafsir) {
    tafsirByAyat.set(t.ayat, t.teks);
  }

  return surat.data.ayat.map((a) => ({
    surah: surat.data.nomor,
    surahNameLatin: surat.data.namaLatin,
    ayat: a.nomorAyat,
    arabic: a.teksArab,
    translation: a.teksIndonesia,
    tafsir: tafsirByAyat.get(a.nomorAyat) ?? "",
  }));
}

async function main() {
  console.log("Fetching surah list...");
  const list = await fetchJson<{ data: SuratListEntry[] }>(`${BASE}/surat`);
  const numbers = list.data.map((s) => s.nomor).sort((a, b) => a - b);

  const allRows: Row[] = [];
  for (let i = 0; i < numbers.length; i += CONCURRENCY) {
    const batch = numbers.slice(i, i + CONCURRENCY);
    console.log(`Fetching surah ${batch[0]}..${batch[batch.length - 1]}`);
    const results = await Promise.all(batch.map(fetchSurah));
    for (const rows of results) allRows.push(...rows);
  }

  console.log(`Fetched ${allRows.length} ayat total. Writing SQL...`);

  const rowSql = allRows.map(
    (r) =>
      `(${r.surah}, '${sqlEscape(r.surahNameLatin)}', ${r.ayat}, '${sqlEscape(
        r.arabic,
      )}', '${sqlEscape(r.translation)}', '${sqlEscape(r.tafsir)}')`,
  );

  const statements: string[] = [];
  let currentValues: string[] = [];
  let currentBytes = 0;
  const flush = () => {
    if (currentValues.length === 0) return;
    statements.push(
      `INSERT INTO ayat (surah, surah_name_latin, ayat, arabic, translation, tafsir) VALUES\n${currentValues.join(",\n")};`,
    );
    currentValues = [];
    currentBytes = 0;
  };
  for (const row of rowSql) {
    const rowBytes = Buffer.byteLength(row, "utf8");
    if (currentBytes + rowBytes > MAX_STATEMENT_BYTES) flush();
    currentValues.push(row);
    currentBytes += rowBytes;
  }
  flush();

  await mkdir("seed", { recursive: true });
  await writeFile("seed/quran.sql", statements.join("\n\n") + "\n", "utf8");
  console.log(`Wrote seed/quran.sql (${statements.length} statements).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
