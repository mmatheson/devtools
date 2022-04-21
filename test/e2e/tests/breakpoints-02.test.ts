import config from "../config";
import { runClassicTest } from "../runTest";

it("Test unhandled divergence while evaluating at a breakpoint.", async () => {
  if (!["gecko"].includes(config.target)) {
    return;
  }
  await runClassicTest({
    example: "doc_rr_basic.html",
    script: "breakpoints-02.js",
  });
});
