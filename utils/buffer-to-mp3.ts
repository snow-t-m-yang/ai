export async function bufferToMp3(
  buffer: ArrayBuffer,
  filename: string,
): Promise<void> {
  await Deno.writeFile(filename, new Uint8Array(buffer), { create: true });
  console.log("Saved:", filename);
}
