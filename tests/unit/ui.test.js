import { describe, expect, it } from "vitest";
import { showSummary } from "../../extension/src/ui.js";

describe("ui helpers", () => {
  it("shows failed source stages in the summary dialog", () => {
    showSummary({
      deleted: [],
      skipped: [],
      failed: [
        {
          title: "Alpha source",
          stage: "open-menu",
          message: "Could not find source menu button"
        }
      ]
    });

    const dialog = document.querySelector("#nlmbd-dialog");

    expect(dialog?.textContent).toContain("Failed: 1");
    expect(dialog?.textContent).toContain("Alpha source");
    expect(dialog?.textContent).toContain("open-menu");
  });
});
