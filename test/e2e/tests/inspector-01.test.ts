import config from "../config";
import { runClassicTest } from "../runTest";

it("Test basic inspector functionality: the inspector is able to show contents when paused according to the child's current position.", async () => {
  if (config.target !== "gecko") {
    return;
  }
  await runClassicTest({
    example: "doc_inspector_basic.html",
    script: "inspector-01.js",
  });
});
