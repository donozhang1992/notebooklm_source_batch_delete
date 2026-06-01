import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const outputDir = resolve("docs/store-screenshots");
const fixtureUrl = pathToFileURL(resolve("tests/fixtures/notebooklm-sources.html")).href;

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 1 });

await page.goto(fixtureUrl);
await page.addScriptTag({ path: "extension/dist/content.js" });
await page.screenshot({
  path: resolve(outputDir, "01-toolbar.png"),
  fullPage: false,
  omitBackground: false
});

await page.getByRole("button", { name: "All" }).click();
await page.getByRole("button", { name: "Delete" }).click();
await page.screenshot({
  path: resolve(outputDir, "02-confirmation.png"),
  fullPage: false,
  omitBackground: false
});

await page.locator("[data-nlmbd-confirm-delete='true']").click();
await page.getByRole("dialog").waitFor({ state: "visible" });
await page.screenshot({
  path: resolve(outputDir, "03-complete.png"),
  fullPage: false,
  omitBackground: false
});

await browser.close();

