import type { Env } from "../types";

export interface DuaRow {
  id: number;
  name: string;
  reference: string;
  pronunciation: string;
  translation: string;
  hadith: string;
  image_key: string;
}

export async function getDua(env: Env, id: number): Promise<DuaRow | null> {
  const row = await env.DB.prepare(
    `SELECT id, name, reference, pronunciation, translation, hadith, image_key
     FROM daily_dua WHERE id = ?`,
  )
    .bind(id)
    .first<DuaRow>();
  return row ?? null;
}

export const DUA_LIST = [
  "Upon Going to sleep",
  "Wake up from sleep",
  "Entering the Toilet",
  "Leaving the Toilet",
  "Start of Wudu",
  "Completion of Wudu",
  "Entering the Mosque",
  "Leaving the Mosque",
  "Before the Meals",
  "Forgetting to recite Bismillah",
  "After meals",
  "After meals (Second Option)",
  "Leaving Home",
  "Entering Home",
  "On Journey",
  "Return From Journey",
  "When Sneezing",
  "Hearing someone sneeze",
  "Sneezers replies back",
  "Entering the Market",
];
