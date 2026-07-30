import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";
import { getSingleAyat } from "../services/quran";
import { parseAyatReference } from "../lib/parseReference";

const USAGE =
  "Kirim perintah /catatan <surat:ayat> untuk mengetahui catatan tafsir Depag mengenai terjemahan ayat tertentu." +
  "\nContoh :\n/catatan 2:255\n/catatan 36:9";

export async function catatan(ctx: CommandContext): Promise<void> {
  const ref = ctx.args[0] ? parseAyatReference(ctx.args[0]) : null;
  if (!ref) {
    await sendMessage(ctx.env, ctx.chatId, USAGE);
    return;
  }

  const row = await getSingleAyat(ctx.env, ref.surah, ref.ayatStart);
  if (!row) {
    await sendMessage(
      ctx.env,
      ctx.chatId,
      `Tidak terdapat catatan tafsir untuk ayat ${ctx.args[0]}.`,
    );
    return;
  }

  await sendMessage(
    ctx.env,
    ctx.chatId,
    `Catatan tafsir QS. ${row.surah_name_latin} : ${row.ayat}:\n${row.tafsir}`,
  );
}
