import type { Env } from "../types";
import { sendMessage } from "../telegram/client";
import { getAyatRange } from "../services/quran";
import { listSubscriberChatIds } from "../services/subscribers";
import { pickRandomVerseRange } from "../dailyVersePicks";

export async function sendDailyVerse(env: Env): Promise<void> {
  const pick = pickRandomVerseRange();
  const rows = await getAyatRange(env, pick.surah, pick.ayatStart, pick.ayatEnd);
  if (rows.length === 0) {
    console.error("Daily verse pick not found in D1", pick);
    return;
  }

  const subscribers = await listSubscriberChatIds(env);
  const intro = `Assalamu'alaikum! Ayat pilihan hari ini adalah QS. ${rows[0]?.surah_name_latin}:${pick.ayatStart}${
    pick.ayatEnd !== pick.ayatStart ? `-${pick.ayatEnd}` : ""
  }`;
  const body = rows.map((r) => `${r.arabic}\n${r.translation}`).join("\n\n");

  for (const chatId of subscribers) {
    await sendMessage(env, chatId, intro);
    await sendMessage(env, chatId, body);
  }
}
