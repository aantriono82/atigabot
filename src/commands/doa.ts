import type { CommandContext } from "../types";
import { sendMessage, sendPhoto } from "../telegram/client";
import { getDua, DUA_LIST } from "../services/dua";

const USAGE =
  "Kirim perintah /doa <nomor do'a> untuk menampilkan do'a sehari-hari yang kamu inginkan lengkap dengan teks Arab dan artinya dalam bahasa Indonesia" +
  "\nContoh :\n/doa 1\n/doa 18." +
  "\n\nBerikut adalah daftar do'a sehari-hari yang ada :\n" +
  DUA_LIST.map((name, i) => `${i + 1}. ${name}`).join("\n");

export async function doa(ctx: CommandContext): Promise<void> {
  const arg = ctx.args[0] ? Number(ctx.args[0]) : NaN;
  if (!Number.isInteger(arg) || arg < 1 || arg > DUA_LIST.length) {
    if (Number.isInteger(arg)) {
      await sendMessage(
        ctx.env,
        ctx.chatId,
        `Nomor ${arg} tidak terdapat dalam daftar do'a. Hanya terdapat ${DUA_LIST.length} do'a. Untuk lihat daftarnya, kirim perintah /doa`,
      );
      return;
    }
    await sendMessage(ctx.env, ctx.chatId, USAGE);
    return;
  }

  const row = await getDua(ctx.env, arg);
  if (!row) {
    await sendMessage(ctx.env, ctx.chatId, `Do'a nomor ${arg} belum tersedia.`);
    return;
  }

  if (row.image_key) {
    await sendPhoto(ctx.env, ctx.chatId, `${ctx.origin}/assets/${row.image_key}`);
  }
  await sendMessage(
    ctx.env,
    ctx.chatId,
    `Do'a: ${row.name}\n\nBacaan Latin:\n${row.pronunciation}\n\nArtinya:\n${row.translation}\n\nReferensi:\n${row.reference}\n\nHadits/Keutamaan:\n${row.hadith}\n\nSumber: Hisnul Muslim (Fortress of the Muslim) oleh Sa'id bin Ali bin Wahf Al-Qahtani`,
  );
}
