import fs from "fs";
import path from "path";

import config from "./config";
import { recordPlaywright, uploadLastRecording } from "./playwright";
import { Target } from "./runTest";
import { waitUntilMessage } from "./utils";

const exampleFile = path.resolve(__dirname, "../../test/example-recordings.json");

export async function getExampleRecordingId(example: string, target: Target) {
  // Recording ID to load in the viewer. If not set, we will record the example
  // in the browser before stopping and switching to the viewer.
  let exampleRecordingId = config.useExampleFile ? readExampleFile()[example] : undefined;

  if (!exampleRecordingId) {
    switch (target) {
      case "node":
        // exampleRecordingId = await recordNodeExample(
        //   state,
        //   path.resolve(__dirname, "../examples", example)
        // );
        break;
      case "gecko":
      case "chromium": {
        exampleRecordingId = await recordPlaywrightExample(example, target);
        break;
      }
      default:
        throw new Error(`Bad target ${target}`);
    }
  }

  // if (!exampleRecordingId) {
  //   state.failures.push(`Failed test: ${example} no recording created`);
  //   console.log(`[${elapsedTime(state)}] Test failed: no recording created`);
  //   return;
  // }

  // if (exampleRecordingId) {
  //   console.log(`Found recording ID ${exampleRecordingId}, loading devtools...`);
  // }

  return exampleRecordingId;
}

function readExampleFile() {
  return fs.existsSync(exampleFile) ? JSON.parse(fs.readFileSync(exampleFile, "utf8")) : {};
}

function updateExampleFile(example: string, recordingId: string) {
  let exampleRecordings = readExampleFile();
  exampleRecordings[example] = recordingId;
  fs.writeFileSync(exampleFile, JSON.stringify(exampleRecordings, null, 2));
}

async function recordPlaywrightExample(example: string, target: Target) {
  const exampleUrl = `${config.devtoolsUrl}/test/examples/${example}`;
  const browserName = target === "gecko" ? "firefox" : "chromium";

  await recordPlaywright(browserName, async page => {
    await page.goto(exampleUrl);
    console.log("Loaded Page");
    await waitUntilMessage(page, "ExampleFinished");
  });

  const recordingId = await uploadLastRecording(exampleUrl);
  if (config.useExampleFile && recordingId) {
    updateExampleFile(example, recordingId);
  }
  return recordingId;
}
