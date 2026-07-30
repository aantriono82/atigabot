export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  is_bot: boolean;
}

export interface TelegramChat {
  id: number;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface CommandContext {
  env: Env;
  chatId: number;
  from: TelegramUser;
  args: string[];
  /** Origin of the incoming webhook request, used to build public asset URLs. */
  origin: string;
}
