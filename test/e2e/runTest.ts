import config from "./config";
import { getExampleRecordingId } from "./getExample";
import { recordPlaywright, uploadLastRecording } from "./playwright";
import { waitUntilMessage } from "./utils";

export type Target = "gecko" | "chromium" | "node";

export async function runClassicTest(args: { example: string; script: string }) {
  const browserName = config.target === "gecko" ? "firefox" : "chromium";
  const exampleRecordingId = await getExampleRecordingId(args.example, config.target as Target);
  const testUrl = `${config.devtoolsUrl}/recording/${exampleRecordingId}?test=${args.script}`;
  let success = false;
  try {
    await recordPlaywright(browserName, async page => {
      await page.goto(testUrl);
      page.on("console", async (msg: any) => console.log(`${args.script}:`, msg.text()));
      const result = await waitUntilMessage(page, "TestFinished", 240_000);
      success = result.success;
    });
  } catch (e) {
    console.error("Recording failed:", e);
  }

  if (!success) {
    const recordingId = await uploadLastRecording(testUrl);
    console.error(
      `::error ::Failure ${args.script}: https://app.replay.io/recording/${recordingId}`
    );
  }
  expect(success).toBe(true);
}
