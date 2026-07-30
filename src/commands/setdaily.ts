import type { CommandContext } from "../types";
import { sendMessage } from "../telegram/client";
import { addSubscriber } from "../services/subscribers";

export async function setdaily(ctx: CommandContext): Promise<void> {
  await addSubscriber(ctx.env, ctx.chatId);
  await sendMessage(
    ctx.env,
    ctx.chatId,
    "Kirim ayat pilihan harian berhasil di-set! Kamu akan menerima ayat pilihan setiap hari jam 06:00 WIB.",
  );
}
