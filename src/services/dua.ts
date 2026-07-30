import type { Env } from "../types";

export interface DuaRow {
  id: number;
  name: string;
  arabic: string;
  reference: string;
  pronunciation: string;
  translation: string;
  hadith: string;
  image_key: string;
}

export async function getDua(env: Env, id: number): Promise<DuaRow | null> {
  const row = await env.DB.prepare(
    `SELECT id, name, arabic, reference, pronunciation, translation, hadith, image_key
     FROM daily_dua WHERE id = ?`,
  )
    .bind(id)
    .first<DuaRow>();
  return row ?? null;
}

export const DUA_LIST = [
  "Sebelum Tidur",
  "Bangun Tidur",
  "Masuk WC",
  "Keluar WC",
  "Awal Wudu",
  "Selesai Wudu",
  "Masuk Masjid",
  "Keluar Masjid",
  "Sebelum Makan",
  "Lupa Membaca Bismillah",
  "Setelah Makan",
  "Setelah Makan (Pilihan Kedua)",
  "Keluar Rumah",
  "Masuk Rumah",
  "Dalam Perjalanan",
  "Pulang dari Perjalanan",
  "Ketika Bersin",
  "Mendengar Orang Bersin",
  "Balasan dari Orang yang Bersin",
  "Masuk Pasar",
];
