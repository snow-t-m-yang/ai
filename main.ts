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
  const uint8Array = new Uint8Array(rawBuffer);

  return c.body(uint8Array, 200, {
    "Content-Type": "audio/mpeg",
    "Content-Length": uint8Array.byteLength.toString(),
  });
});

Deno.serve(app.fetch);
