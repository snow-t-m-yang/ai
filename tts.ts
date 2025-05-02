import "jsr:@std/dotenv/load";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

function initSynthesizer() {
  const key = Deno.env.get("SPEECH_KEY")!;
  const region = Deno.env.get("SPEECH_REGION")!;
  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
  speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoMultilingualNeural";
  speechConfig.speechSynthesisLanguage = "zh-CN";
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  return new sdk.SpeechSynthesizer(speechConfig);
}


function synthToFile(text: string, filename: string): Promise<void> {
  const synthesizer = initSynthesizer();

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
        synthesizer.close();
      },
      (err) => {
        reject(err);
        console.error("Error: ", err);
        synthesizer.close();
      },
    );
  });
}

export async function synthToBuffer(text: string): Promise<ArrayBuffer> {
  const synthesizer = initSynthesizer();

  // Wrap the callback-based SDK method in a Promise
  let result: sdk.SpeechSynthesisResult;
  try {
    console.log("Start synthesizing...");
    result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (synthesisResult) => resolve(synthesisResult),
        (error) => reject(error),
      );
    });
  } catch (error) {
    throw new Error("Synthesis failed: " + error);
  } finally {
    console.log("Finished synthesizing.");
    synthesizer.close();
  }
  // Check result and return buffer or throw
  if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
    // Return the raw ArrayBuffer of the audio data
    return result.audioData;
  } else {
    throw new Error("Synthesis failed: " + result.errorDetails);
  }
}
