import { Hono } from "hono";
import type { Env, TelegramUpdate } from "./types";
import { handleUpdate, verifyWebhookSecret } from "./telegram/webhook";
import { sendDailyVerse } from "./scheduled/dailyVerse";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("AtigaBot is running."));

app.post("/telegram/webhook", async (c) => {
  if (!verifyWebhookSecret(c.req.raw, c.env)) {
    return c.text("Forbidden", 403);
  }

  const update = await c.req.json<TelegramUpdate>();
  const origin = new URL(c.req.url).origin;
  c.executionCtx.waitUntil(handleUpdate(update, c.env, origin));
  return c.text("OK");
});

app.get("/assets/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.ASSETS.get(key);
  if (!object) {
    return c.text("Not found", 404);
  }
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "image/png",
      "cache-control": "public, max-age=86400",
    },
  });
});

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(sendDailyVerse(env));
  },
} satisfies ExportedHandler<Env>;
