import type { Env } from "../types";

export interface AyatRow {
  surah: number;
  surah_name_latin: string;
  ayat: number;
  arabic: string;
  translation: string;
  tafsir: string;
}

export async function getAyatRange(
  env: Env,
  surah: number,
  ayatStart: number,
  ayatEnd: number,
): Promise<AyatRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT surah, surah_name_latin, ayat, arabic, translation, tafsir
     FROM ayat WHERE surah = ? AND ayat BETWEEN ? AND ?
     ORDER BY ayat ASC`,
  )
    .bind(surah, ayatStart, ayatEnd)
    .all<AyatRow>();
  return results;
}

export async function getSingleAyat(
  env: Env,
  surah: number,
  ayat: number,
): Promise<AyatRow | null> {
  const row = await env.DB.prepare(
    `SELECT surah, surah_name_latin, ayat, arabic, translation, tafsir
     FROM ayat WHERE surah = ? AND ayat = ?`,
  )
    .bind(surah, ayat)
    .first<AyatRow>();
  return row ?? null;
}

export interface SearchHit {
  surah: number;
  surah_name_latin: string;
  ayat: number;
}

export async function searchAyat(
  env: Env,
  keyword: string,
  limit = 100,
): Promise<SearchHit[]> {
  // Wrap as an FTS5 phrase literal so punctuation in user input (", -, etc.)
  // can't be interpreted as FTS5 query syntax.
  const phrase = `"${keyword.replace(/"/g, '""')}"`;
  const { results } = await env.DB.prepare(
    `SELECT a.surah as surah, a.surah_name_latin as surah_name_latin, a.ayat as ayat
     FROM ayat_fts f
     JOIN ayat a ON a.id = f.rowid
     WHERE f.translation MATCH ?
     ORDER BY rank
     LIMIT ?`,
  )
    .bind(phrase, limit)
    .all<SearchHit>();
  return results;
}
