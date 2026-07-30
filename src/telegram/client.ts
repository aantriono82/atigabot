import type { Env } from "../types";

function apiUrl(env: Env, method: string): string {
  return `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`;
}

export async function sendMessage(
  env: Env,
  chatId: number,
  text: string,
): Promise<void> {
  const res = await fetch(apiUrl(env, "sendMessage"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    console.error("sendMessage failed", chatId, await res.text());
  }
}

export async function sendPhoto(
  env: Env,
  chatId: number,
  photoUrl: string,
): Promise<void> {
  const res = await fetch(apiUrl(env, "sendPhoto"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl }),
  });
  if (!res.ok) {
    console.error("sendPhoto failed", chatId, await res.text());
  }
}

export async function setWebhook(
  env: Env,
  url: string,
): Promise<{ ok: boolean; description?: string }> {
  const res = await fetch(apiUrl(env, "setWebhook"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    }),
  });
  return res.json();
}
