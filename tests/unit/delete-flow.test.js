import { describe, expect, it, vi } from "vitest";
import { createCancellationToken, deleteRowsSequentially } from "../../extension/src/delete-flow.js";

describe("delete flow", () => {
  it("deletes rows sequentially", async () => {
    const rows = createRows(["Alpha", "Beta"]);
    const clicks = [];

    const result = await deleteRowsSequentially(rows, {
      root: document,
      actionDelayMs: 0,
      waitTimeoutMs: 100,
      click: (element) => {
        clicks.push(element.dataset.action || element.textContent);
        element.click();
      }
    });

    expect(result.deleted.map((item) => item.title)).toEqual(["Alpha", "Beta"]);
    expect(clicks).toEqual(["menu-Alpha", "Delete", "Delete", "menu-Beta", "Delete", "Delete"]);
    expect(document.querySelectorAll("[role='listitem']")).toHaveLength(0);
  });

  it("collects source-level failures and continues", async () => {
    const rows = createRows(["Alpha", "Beta"]);
    rows[0].querySelector("button").remove();

    const result = await deleteRowsSequentially(rows, {
      root: document,
      actionDelayMs: 0,
      waitTimeoutMs: 100
    });

    expect(result.failed).toMatchObject([{ title: "Alpha", stage: "open-menu" }]);
    expect(result.deleted.map((item) => item.title)).toEqual(["Beta"]);
    expect(document.body.textContent).toContain("Alpha");
    expect(document.body.textContent).not.toContain("Beta");
  });

  it("stops before the next source when cancelled", async () => {
    const rows = createRows(["Alpha", "Beta", "Gamma"]);
    const token = createCancellationToken();
    let confirmed = 0;

    const result = await deleteRowsSequentially(rows, {
      root: document,
      token,
      actionDelayMs: 0,
      waitTimeoutMs: 100,
      click: (element) => {
        element.click();
        if (element.dataset.fixtureConfirm) {
          confirmed += 1;
          if (confirmed === 1) token.cancel();
        }
      }
    });

    expect(result.cancelled).toBe(true);
    expect(result.deleted.map((item) => item.title)).toEqual(["Alpha"]);
    expect(result.skipped.map((item) => item.title)).toEqual(["Beta", "Gamma"]);
    expect(document.querySelectorAll("[role='listitem']")).toHaveLength(2);
  });

  it("retries failed deletion attempts according to policy", async () => {
    const rows = createRows(["Alpha"]);
    const click = vi.fn((element) => {
      if (element.dataset.action === "menu-Alpha" && click.mock.calls.length === 1) {
        return;
      }
      element.click();
    });

    const result = await deleteRowsSequentially(rows, {
      root: document,
      actionDelayMs: 0,
      waitTimeoutMs: 50,
      retryCount: 1,
      click
    });

    expect(result.failed).toHaveLength(0);
    expect(result.deleted.map((item) => item.title)).toEqual(["Alpha"]);
    expect(click).toHaveBeenCalled();
  });

  it("has an importable harness", async () => {
    const token = createCancellationToken();
    token.cancel();
    const row = document.createElement("div");
    row.textContent = "Alpha";
    const result = await deleteRowsSequentially([row], { token });
    expect(result.cancelled).toBe(true);
    expect(result.skipped).toHaveLength(1);
  });
});

function createRows(names) {
  document.body.innerHTML = `<aside aria-label="Sources">${names.map((name) => `
    <div role="listitem" data-name="${name}">
      <span>${name}</span>
      <button aria-label="More options" data-action="menu-${name}">...</button>
    </div>
  `).join("")}</aside>`;

  document.body.addEventListener("click", handleFixtureClick);
  return Array.from(document.querySelectorAll("[role='listitem']"));
}

function handleFixtureClick(event) {
  if (event.target.matches("button[aria-label='More options']")) {
    document.querySelector("[data-fixture-menu]")?.remove();
    const menu = document.createElement("div");
    menu.dataset.fixtureMenu = "true";
    menu.sourceRow = event.target.closest("[role='listitem']");
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = "Delete";
    item.dataset.fixtureDelete = "true";
    menu.append(item);
    document.body.append(menu);
  }

  if (event.target.matches("[data-fixture-delete]")) {
    document.querySelector("[data-fixture-confirm]")?.remove();
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.textContent = "Delete";
    confirm.dataset.fixtureConfirm = "true";
    confirm.sourceRow = document.querySelector("[data-fixture-menu]")?.sourceRow;
    document.body.append(confirm);
  }

  if (event.target.matches("[data-fixture-confirm]")) {
    event.target.sourceRow?.remove();
    document.querySelector("[data-fixture-menu]")?.remove();
    event.target.remove();
  }
}
