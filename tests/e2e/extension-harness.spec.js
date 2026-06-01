import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const fixtureUrl = pathToFileURL(resolve("tests/fixtures/notebooklm-sources.html")).href;

test.describe("extension fixture harness", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await page.addScriptTag({ path: "extension/dist/content.js" });
  });

  test("injects toolbar into the source panel", async ({ page }) => {
    await expect(page.locator("#nlmbd-toolbar")).toBeVisible();
  });

  test("injects source checkboxes", async ({ page }) => {
    await expect(page.locator(".nlmbd-checkbox")).toHaveCount(3);
  });

  test("selects all visible sources", async ({ page }) => {
    await page.getByRole("button", { name: "All" }).click();

    await expect(page.locator(".nlmbd-checkbox:checked")).toHaveCount(3);
  });

  test("deletes selected sources through the fixture UI", async ({ page }) => {
    await page.getByRole("button", { name: "All" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("dialog")).toContainText("Alpha research page");
    await page.locator("[data-nlmbd-confirm-delete='true']").click();

    await expect(page.locator("[role='listitem']")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toContainText("Deleted: 3");
  });

  test("does not duplicate toolbar after rerender", async ({ page }) => {
    await page.evaluate(() => {
      const panel = document.querySelector("aside[aria-label='Sources']");
      panel.append(document.createElement("div"));
    });

    await expect(page.locator("#nlmbd-toolbar")).toHaveCount(1);
  });

  test("keeps one toolbar after repeated source panel mutations", async ({ page }) => {
    await page.evaluate(async () => {
      const panel = document.querySelector("aside[aria-label='Sources']");
      for (let index = 0; index < 8; index += 1) {
        panel.append(document.createElement("div"));
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    });

    await expect(page.locator("#nlmbd-toolbar")).toHaveCount(1);
  });

  test("cancels before deleting the next source", async ({ page }) => {
    await page.getByRole("button", { name: "All" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.locator("[data-nlmbd-confirm-delete='true']").click();
    await page.locator("[data-nlmbd-cancel-delete='true']").click();

    await expect(page.getByRole("dialog")).toContainText("Skipped:");
    const remaining = await page.locator("[role='listitem']").count();
    expect(remaining).toBeGreaterThan(0);
  });
});
