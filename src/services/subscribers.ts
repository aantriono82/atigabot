import type { Env } from "../types";

export async function addSubscriber(env: Env, chatId: number): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO daily_subscribers (chat_id, subscribed_at)
     VALUES (?, ?)
     ON CONFLICT(chat_id) DO NOTHING`,
  )
    .bind(chatId, new Date().toISOString())
    .run();
}

export async function listSubscriberChatIds(env: Env): Promise<number[]> {
  const { results } = await env.DB.prepare(
    `SELECT chat_id FROM daily_subscribers`,
  ).all<{ chat_id: number }>();
  return results.map((r) => r.chat_id);
}
