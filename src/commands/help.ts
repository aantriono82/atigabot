import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";

export async function help(ctx: CommandContext): Promise<void> {
  await sendMessage(
    ctx.env,
    ctx.chatId,
    "/shalat <alamat> : menampilkan jadwal sholat di wilayahmu hari ini." +
      "\n/quran <surat:ayat> : menampilkan ayat Al-Qur'an pilihanmu." +
      "\n/cari <kata> : menampilkan ayat yang terdapat kata tersebut" +
      "\n/catatan <surat:ayat> : menampilkan catatan tafsir Depag mengenai ayat tertentu" +
      "\n/doa <nomor do'a> : menampilkan do'a harian yang kamu pilih" +
      "\n/setdaily : mendapat kiriman ayat pilihan tiap hari" +
      "\n/help : bantuan",
  );
}
