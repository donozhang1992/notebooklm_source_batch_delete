import { describe, expect, it } from "vitest";
import { findMenuItem, findRowMenuButton, findSourcePanel, findSourceRows, getSourceTitle } from "../../extension/src/dom.js";

describe("dom helpers", () => {
  it("finds the NotebookLM source panel", () => {
    document.body.innerHTML = `
      <main>
        <aside aria-label="Sources">
          <div role="listitem">Alpha</div>
        </aside>
      </main>
    `;

    expect(findSourcePanel(document)?.getAttribute("aria-label")).toBe("Sources");
  });

  it("finds a NotebookLM-like sources panel without relying on button aria labels", () => {
    document.body.innerHTML = `
      <div class="app">
        <button aria-label="Add sources">+ Add sources</button>
        <div class="left-panel">
          <div>
            <h2>Sources</h2>
            <button>+ Add sources</button>
            <div>Search the web for new sources</div>
            <button>Select all</button>
            <div class="source-row">Building Production-Ready Multi-Agent Systems...</div>
          </div>
        </div>
      </div>
    `;

    const panel = findSourcePanel(document);

    expect(panel).not.toBeNull();
    expect(panel.tagName).toBe("DIV");
    expect(panel.matches("button")).toBe(false);
    expect(panel.textContent).toContain("Building Production-Ready");
  });

  it("enumerates visible source rows without returning container elements", () => {
    document.body.innerHTML = `
      <aside aria-label="Sources">
        <div data-testid="source-list">
          <div role="listitem" data-source-id="a">Alpha</div>
          <div role="listitem" data-source-id="b" hidden>Beta</div>
          <div role="listitem" data-source-id="c">Gamma</div>
        </div>
      </aside>
    `;

    expect(findSourceRows(document).map((row) => row.dataset.sourceId)).toEqual(["a", "c"]);
  });

  it("falls back to rows derived from native NotebookLM checkboxes", () => {
    document.body.innerHTML = `
      <section>
        <div>Select all <span role="checkbox" aria-checked="false"></span></div>
        <div class="source-card" data-source-id="a">
          <span>Alpha source</span>
          <span role="checkbox" aria-checked="true"></span>
        </div>
        <div class="source-card" data-source-id="b">
          <span>Beta source</span>
          <span role="checkbox" aria-checked="false"></span>
        </div>
      </section>
    `;

    expect(findSourceRows(document).map((row) => row.dataset.sourceId)).toEqual(["a", "b"]);
  });

  it("finds Angular Material NotebookLM source rows and titles", () => {
    document.body.innerHTML = `
      <section>
        <input type="checkbox" aria-label="Select all sources" class="mdc-checkbox__native-control">
        <div class="source-entry" data-source-id="a">
          <button class="source-stretched-button" aria-label="Alpha title"></button>
          <button class="source-item-more-button" aria-label="More">more_vert</button>
          <mat-checkbox class="mat-mdc-checkbox select-checkbox mat-mdc-checkbox-checked">
            <input type="checkbox" class="mdc-checkbox__native-control mdc-checkbox--selected" aria-label="Alpha title" checked>
          </mat-checkbox>
        </div>
        <div class="source-entry" data-source-id="b">
          <button class="source-stretched-button" aria-label="Beta title"></button>
          <button class="source-item-more-button" aria-label="More">more_vert</button>
          <mat-checkbox class="mat-mdc-checkbox select-checkbox">
            <input type="checkbox" class="mdc-checkbox__native-control" aria-label="Beta title">
          </mat-checkbox>
        </div>
      </section>
    `;

    const rows = findSourceRows(document);

    expect(rows.map((row) => row.dataset.sourceId)).toEqual(["a", "b"]);
    expect(getSourceTitle(rows[0])).toBe("Alpha title");
  });

  it("prefers Angular Material source rows over generic source containers", () => {
    document.body.innerHTML = `
      <section data-testid="source-list">
        <div class="source-entry" data-source-id="a">
          <button class="source-stretched-button" aria-label="Alpha title"></button>
          <button class="source-item-more-button" aria-label="More">more_vert</button>
          <input type="checkbox" class="mdc-checkbox__native-control mdc-checkbox--selected" aria-label="Alpha title" checked>
        </div>
      </section>
    `;

    expect(findSourceRows(document).map((row) => row.dataset.sourceId)).toEqual(["a"]);
  });

  it("extracts source titles from aria labels before text content", () => {
    const row = document.createElement("div");
    row.setAttribute("aria-label", "Alpha source");
    row.textContent = "Fallback text";

    expect(getSourceTitle(row)).toBe("Alpha source");
  });

  it("finds row menu buttons by ARIA labels", () => {
    document.body.innerHTML = `
      <div role="listitem">
        <span>Alpha</span>
        <button aria-label="More options">...</button>
      </div>
    `;

    expect(findRowMenuButton(document.querySelector("[role='listitem']"))?.tagName).toBe("BUTTON");
  });

  it("targets NotebookLM source item menu buttons instead of source open buttons", () => {
    document.body.innerHTML = `
      <div class="source-entry">
        <button class="source-stretched-button" aria-label="Alpha title"></button>
        <button class="source-item-more-button mat-mdc-menu-trigger" aria-label="More">more_vert</button>
        <input type="checkbox" class="mdc-checkbox__native-control mdc-checkbox--selected" aria-label="Alpha title" checked>
      </div>
    `;

    const menuButton = findRowMenuButton(document.querySelector(".source-entry"));

    expect(menuButton).not.toBeNull();
    expect(menuButton.classList.contains("source-item-more-button")).toBe(true);
    expect(menuButton.classList.contains("source-stretched-button")).toBe(false);
  });

  it("does not treat generic NotebookLM filter menu triggers as source row menus", () => {
    document.body.innerHTML = `
      <div class="source-entry">
        <button class="source-stretched-button" aria-label="Alpha title"></button>
        <button class="corpus-select mat-mdc-menu-trigger" aria-haspopup="menu">Web</button>
        <input type="checkbox" class="mdc-checkbox__native-control mdc-checkbox--selected" aria-label="Alpha title" checked>
      </div>
    `;

    expect(findRowMenuButton(document.querySelector(".source-entry"))).toBeNull();
  });

  it("ignores extension-owned buttons when finding NotebookLM menu items", () => {
    document.body.innerHTML = `
      <section id="nlmbd-toolbar">
        <button>Delete</button>
      </section>
      <div role="menu">
        <button>Delete source</button>
      </div>
    `;

    expect(findMenuItem(document)?.textContent).toBe("Delete source");
  });

  it("prefers the real NotebookLM remove-source menu item class", () => {
    document.body.innerHTML = `
      <div role="menu">
        <button role="menuitem" class="mat-mdc-menu-item more-menu-button more-menu-edit-source-button">edit Rename source</button>
        <button role="menuitem" class="mat-mdc-menu-item more-menu-button more-menu-delete-source-button">delete Remove source</button>
      </div>
    `;

    expect(findMenuItem(document)?.classList.contains("more-menu-delete-source-button")).toBe(true);
  });

  it("has an importable harness", () => {
    document.body.innerHTML = `<aside aria-label="Sources"><div role="listitem">Alpha</div></aside>`;
    expect(findSourcePanel(document)).not.toBeNull();
    expect(findSourceRows(document)).toHaveLength(1);
    expect(getSourceTitle(findSourceRows(document)[0])).toBe("Alpha");
  });
});
