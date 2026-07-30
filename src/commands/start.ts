import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";

export async function start(ctx: CommandContext): Promise<void> {
  await sendMessage(
    ctx.env,
    ctx.chatId,
    `Assalamu'alaikum ${ctx.from.first_name}!` +
      "\nSelamat datang di AtigaBot." +
      "\nAtigaBot akan membantumu untuk menampilkan jadwal shalat, ayat Al-Qur'an dan do'a sehari-hari." +
      "\nKirim perintah /shalat <alamat> untuk tahu jadwal sholat di wilayahmu hari ini." +
      "\nKirim perintah /quran <surat:ayat> untuk menampilkan ayat Al-Qur'an pilihanmu." +
      "\nKirim perintah /cari <kata> untuk menampilkan ayat yang terdapat kata tersebut" +
      "\nKirim perintah /catatan <surat:ayat> untuk menampilkan catatan tafsir Depag mengenai ayat tertentu" +
      "\nKirim perintah /doa <nomor do'a> untuk menampilkan do'a harian yang kamu pilih" +
      "\nKirim perintah /setdaily untuk mendapat kiriman ayat pilihan tiap hari" +
      "\nKirim perintah /help untuk bantuan",
  );
}
