import type { CommandContext, Env, TelegramUpdate } from "../types";
import { start } from "../commands/start";
import { help } from "../commands/help";
import { shalat } from "../commands/shalat";
import { quran } from "../commands/quran";
import { cari } from "../commands/cari";
import { catatan } from "../commands/catatan";
import { doa } from "../commands/doa";
import { setdaily } from "../commands/setdaily";
import { unknown } from "../commands/unknown";

type Handler = (ctx: CommandContext) => Promise<void>;

const COMMANDS: Record<string, Handler> = {
  "/start": start,
  "/help": help,
  "/shalat": shalat,
  "/quran": quran,
  "/cari": cari,
  "/catatan": catatan,
  "/doa": doa,
  "/setdaily": setdaily,
};

export function verifyWebhookSecret(req: Request, env: Env): boolean {
  return (
    req.headers.get("X-Telegram-Bot-Api-Secret-Token") ===
    env.TELEGRAM_WEBHOOK_SECRET
  );
}

export async function handleUpdate(
  update: TelegramUpdate,
  env: Env,
  origin: string,
): Promise<void> {
  const message = update.message;
  if (!message || !message.text || !message.from) return;

  const chatId = message.chat.id;
  const from = message.from;
  const text = message.text.trim();

  if (!text.startsWith("/")) {
    await start({ env, chatId, from, args: [], origin });
    return;
  }

  const [commandRaw, ...args] = text.split(/\s+/);
  // Strip @BotName suffix (Telegram appends it in group chats), e.g. /quran@AtigaBot
  const command = commandRaw?.split("@")[0]?.toLowerCase();
  const handler = (command && COMMANDS[command]) || unknown;

  await handler({ env, chatId, from, args, origin });
}
