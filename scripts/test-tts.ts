import { bufferToMp3 } from "../utils/bufferToMp3.ts";

// 1. call the API
const res = await fetch("http://localhost:8000/api/synthesizer/v0", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "你好，我是Deno，こんにちは、私はDenoと申します" }),
});

if (!res.ok) {
  console.error("API error", await res.text());
  Deno.exit(1);
}

// 2. extract and convert buffer
const { buffer: byteArray } = await res.json() as { buffer: number[] };
const arrayBuffer = new Uint8Array(byteArray).buffer;

// 3. write to MP3
await bufferToMp3(arrayBuffer, "demo.mp3");
