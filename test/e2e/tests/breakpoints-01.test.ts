import config from "../config";
import { runClassicTest } from "../runTest";

it("Test basic breakpoint functionality.", async () => {
  if (!["gecko", "chromium"].includes(config.target)) {
    return;
  }
  await runClassicTest({
    example: "doc_rr_basic.html",
    script: "breakpoints-01.js",
  });
});
