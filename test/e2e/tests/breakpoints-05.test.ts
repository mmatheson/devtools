import config from "../config";
import { runClassicTest } from "../runTest";

it("Test interaction of breakpoints with debugger statements.", async () => {
  if (!["gecko", "chromium"].includes(config.target)) {
    return;
  }
  await runClassicTest({
    example: "doc_debugger_statements.html",
    script: "breakpoints-05.js",
  });
});
