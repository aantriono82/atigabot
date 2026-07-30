import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";

export async function unknown(ctx: CommandContext): Promise<void> {
  await sendMessage(
    ctx.env,
    ctx.chatId,
    "Maaf, command yang kamu masukkan tidak ada. Kirim perintah /help untuk bantuan.",
  );
}
