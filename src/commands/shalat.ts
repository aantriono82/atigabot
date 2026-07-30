import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";
import { getPrayerTimesByAddress } from "../services/aladhan";

const USAGE =
  "Kirim perintah /shalat <wilayah> untuk tahu jadwal shalat di wilayahmu hari ini." +
  "\nContoh :\n/shalat Bekasi\n/shalat Universitas Al Azhar Indonesia";

export async function shalat(ctx: CommandContext): Promise<void> {
  const address = ctx.args.join(" ").trim();
  if (!address) {
    await sendMessage(ctx.env, ctx.chatId, USAGE);
    return;
  }

  try {
    const t = await getPrayerTimesByAddress(address);
    await sendMessage(
      ctx.env,
      ctx.chatId,
      `--Jadwal ${t.date}--\n` +
        `Subuh ${t.fajr}\n` +
        `Matahari Terbit ${t.sunrise}\n` +
        `Dzuhur ${t.dhuhr}\n` +
        `Ashar ${t.asr}\n` +
        `Matahari Terbenam ${t.sunset}\n` +
        `Maghrib ${t.maghrib}\n` +
        `Isya ${t.isha}\n` +
        `Imsak ${t.imsak}\n` +
        `Tengah Malam ${t.midnight}\n\n` +
        "Metode : Umm al-Qura, Makkah\n\n" +
        "Biasakan shalat di awal waktu, ya!:)",
    );
  } catch {
    await sendMessage(
      ctx.env,
      ctx.chatId,
      `Maaf, tidak dapat menemukan jadwal shalat untuk wilayah "${address}". Coba masukkan nama wilayah yang lebih spesifik.`,
    );
  }
}
