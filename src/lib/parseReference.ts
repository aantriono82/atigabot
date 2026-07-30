export interface AyatReference {
  surah: number;
  ayatStart: number;
  ayatEnd: number;
}

/** Parses "surat:ayat" or "surat:ayat-ayat", e.g. "2:255" or "2:255-256". */
export function parseAyatReference(input: string): AyatReference | null {
  const match = /^(\d+):(\d+)(?:-(\d+))?$/.exec(input.trim());
  if (!match) return null;
  const surah = Number(match[1]);
  const ayatStart = Number(match[2]);
  const ayatEnd = match[3] ? Number(match[3]) : ayatStart;
  if (ayatEnd < ayatStart) return null;
  return { surah, ayatStart, ayatEnd };
}
