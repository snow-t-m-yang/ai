import "jsr:@std/dotenv/load";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const key = Deno.env.get("SPEECH_KEY")!;
const region = Deno.env.get("SPEECH_REGION")!;
const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoMultilingualNeural";
speechConfig.speechSynthesisOutputFormat =
  sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

const rl = readline.createInterface({ input, output });

const rawFilename = await rl.question("Output file name (without extension): ");
const filename = rawFilename.endsWith(".mp3")
  ? rawFilename
  : `${rawFilename}.mp3`;
const text = await rl.question("Text to synthesize: ");
rl.close();

let synthesizer = new sdk.SpeechSynthesizer(speechConfig);
function synthToFile(text: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      async (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          await Deno.writeFile(filename, new Uint8Array(result.audioData));
          console.log("Saved:", filename);
          resolve();
        } else {
          reject(new Error("Synthesis failed: " + result.errorDetails));
        }
        console.log("Done");
        synthesizer.close();
        synthesizer = undefined!;
      },
      (err) => {
        reject(err);
        console.error("Error: ", err);
        synthesizer.close();
        synthesizer = undefined!;
      },
    );
  });
}

await synthToFile(text, filename);
// ensure Deno process exits once synthesis is done
Deno.exit(0);
