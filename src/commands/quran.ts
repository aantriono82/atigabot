import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";
import { getAyatRange } from "../services/quran";
import { parseAyatReference } from "../lib/parseReference";

const USAGE =
  "Kirim perintah /quran <surat:ayat> untuk menampilkan ayat Al-Qur'an pilihanmu!" +
  "\nContoh :\n/quran 2:255\n/quran 2:255-256" +
  "\n\nKeterangan :\nGunakan perintah /catatan <surat:ayat> untuk melihat catatan tafsir Depag mengenai ayat tersebut." +
  "\nKamu juga bisa mencari kata tertentu dan menampilkan surat dan ayat berapa saja dalam Al-Qur'an yang terdapat kata tersebut. Kirim perintah /cari <kata>";

export async function quran(ctx: CommandContext): Promise<void> {
  const ref = ctx.args[0] ? parseAyatReference(ctx.args[0]) : null;
  if (!ref) {
    await sendMessage(ctx.env, ctx.chatId, USAGE);
    return;
  }

  const rows = await getAyatRange(ctx.env, ref.surah, ref.ayatStart, ref.ayatEnd);
  if (rows.length === 0) {
    await sendMessage(
      ctx.env,
      ctx.chatId,
      `Ayat ${ctx.args[0]} tidak ditemukan. Pastikan nomor surat dan ayat benar.`,
    );
    return;
  }

  for (const row of rows) {
    await sendMessage(ctx.env, ctx.chatId, `${row.arabic}\n${row.translation}`);
  }
}
