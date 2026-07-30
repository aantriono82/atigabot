export interface VerseRange {
  surah: number;
  ayatStart: number;
  ayatEnd: number;
}

// Ported from the original bot's dailyquran.txt. One entry, "6-159-165", used
// a dash instead of a colon in the source file; corrected to 6:159-165 here.
const RAW_PICKS = [
  "2:183-186",
  "2:254-257",
  "2:261-265",
  "2:283-286",
  "3:18-20",
  "3:102-108",
  "3:110-115",
  "3:133-136",
  "3:190-194",
  "4:1-6",
  "5:6-9",
  "6:159-165",
  "9:128-129",
  "12:1-6",
  "14:5-8",
  "16:125-128",
  "17:1-10",
  "17:78-85",
  "18:1-13",
  "18:102-110",
  "23:1-11",
  "24:35-38",
  "25:72-77",
  "30:1-11",
  "31:12-19",
  "33:21-24",
  "33:40-48",
  "33:70-73",
  "36:77-83",
  "38:71-88",
  "39:71-74",
  "41:30-35",
  "48:1-6",
  "48:27-29",
  "49:1-6",
  "58:9-11",
  "59:18-24",
  "61:10-14",
  "62:9-11",
  "63:9-11",
  "64:11-18",
  "66:8-12",
];

export const DAILY_VERSE_PICKS: VerseRange[] = RAW_PICKS.map((entry) => {
  const [surahStr = "", range = ""] = entry.split(":");
  const [startStr = "", endStr = ""] = range.split("-");
  return {
    surah: Number(surahStr),
    ayatStart: Number(startStr),
    ayatEnd: Number(endStr),
  };
});

export function pickRandomVerseRange(): VerseRange {
  const pick =
    DAILY_VERSE_PICKS[Math.floor(Math.random() * DAILY_VERSE_PICKS.length)];
  if (!pick) {
    throw new Error("DAILY_VERSE_PICKS is empty");
  }
  return pick;
}
