import { Hono } from "jsr:@hono/hono";
import { synthToBuffer } from "./tts.ts";

const app = new Hono();

app.post("/api/synthesizer/v0", async (c) => {
  const { text } = await c.req.json();
  console.log("Request body:", text);
  if (!text) {
    return c.json({ error: "Text and filename are required" }, 400);
  }

  if (typeof text !== "string") {
    return c.json({ error: "Text and filename must be strings" }, 400);
  }

  const textLength = text.length;

  console.warn(`Text length: ${textLength}`);

  const rawBuffer = await synthToBuffer(text);
  const byteArray = Array.from(new Uint8Array(rawBuffer));

  return c.json({
    buffer: byteArray,
  });
});

Deno.serve(app.fetch);
