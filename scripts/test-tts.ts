import { bufferToMp3 } from "../utils/buffer-to-mp3.ts";

// 1. call the API
const res = await fetch("http://localhost:8000/api/synthesizer/v0", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "你好，世界！",
  }),
});

if (!res.ok) {
  console.error("API error", await res.text());
  Deno.exit(1);
}

const arrayBuffer = await res.arrayBuffer();

await bufferToMp3(arrayBuffer, "demo.mp3");

Deno.exit(0);
