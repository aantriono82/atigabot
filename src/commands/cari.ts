import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";
import { searchAyat } from "../services/quran";

const USAGE =
  "Kirim perintah /cari <kata> untuk menampilkan surat dan ayat apa saja dalam Al-Qur'an yang terdapat kata tersebut." +
  "\nContoh :\n/cari puasa\n/cari beriman" +
  "\n\nMaksimal surat dan ayat yang tampil sebanyak 100";

export async function cari(ctx: CommandContext): Promise<void> {
  const kata = ctx.args[0]?.toLowerCase();
  if (!kata) {
    await sendMessage(ctx.env, ctx.chatId, USAGE);
    return;
  }

  const hits = await searchAyat(ctx.env, kata, 100);
  if (hits.length === 0) {
    await sendMessage(ctx.env, ctx.chatId, `Tidak ada hasil pencarian untuk kata ${kata}`);
    return;
  }

  const list = hits
    .map((h) => `QS. ${h.surah_name_latin} : ${h.ayat}`)
    .join("\n");
  await sendMessage(ctx.env, ctx.chatId, `Hasil pencarian untuk kata ${kata}:\n${list}`);
}
