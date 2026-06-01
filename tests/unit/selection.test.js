import { describe, expect, it } from "vitest";
import { clearSelection, ensureRowCheckbox, getSelectedRows, selectAllVisible, syncSelectionUi } from "../../extension/src/selection.js";

describe("selection helpers", () => {
  it("injects one checkbox per visible source row", () => {
    document.body.innerHTML = `
      <aside aria-label="Sources">
        <div role="listitem">Alpha</div>
        <div role="listitem">Beta</div>
      </aside>
    `;

    syncSelectionUi(document);
    syncSelectionUi(document);

    expect(document.querySelectorAll(".nlmbd-checkbox")).toHaveLength(2);
  });

  it("selects all visible source rows", () => {
    document.body.innerHTML = `
      <aside aria-label="Sources">
        <div role="listitem">Alpha</div>
        <div role="listitem" hidden>Beta</div>
        <div role="listitem">Gamma</div>
      </aside>
    `;

    syncSelectionUi(document);
    selectAllVisible(document);

    expect(getSelectedRows(document).map((row) => row.textContent.trim())).toEqual(["Alpha", "Gamma"]);
  });

  it("clears selected source rows", () => {
    document.body.innerHTML = `
      <aside aria-label="Sources">
        <div role="listitem">Alpha</div>
        <div role="listitem">Beta</div>
      </aside>
    `;

    selectAllVisible(document);
    clearSelection(document);

    expect(getSelectedRows(document)).toHaveLength(0);
  });

  it("does not duplicate a row checkbox", () => {
    const row = document.createElement("div");
    row.setAttribute("role", "listitem");

    expect(ensureRowCheckbox(row)).toBe(ensureRowCheckbox(row));
    expect(row.querySelectorAll(".nlmbd-checkbox")).toHaveLength(1);
  });

  it("uses native NotebookLM checkboxes when present", () => {
    document.body.innerHTML = `
      <section>
        <div class="source-card">Alpha <span role="checkbox" aria-checked="false"></span></div>
        <div class="source-card">Beta <span role="checkbox" aria-checked="true"></span></div>
      </section>
    `;
    const checkboxes = document.querySelectorAll("[role='checkbox']");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("click", () => {
        checkbox.setAttribute("aria-checked", checkbox.getAttribute("aria-checked") === "true" ? "false" : "true");
      });
    });

    expect(getSelectedRows(document).map((row) => row.textContent.trim())).toEqual(["Beta"]);

    selectAllVisible(document);
    expect(getSelectedRows(document)).toHaveLength(2);
    expect(document.querySelectorAll(".nlmbd-checkbox")).toHaveLength(0);

    clearSelection(document);
    expect(getSelectedRows(document)).toHaveLength(0);
  });

  it("clicks a native select-all control when available", () => {
    document.body.innerHTML = `
      <section>
        <button>Select all</button>
        <div class="source-card">Alpha <span role="checkbox" aria-checked="false"></span></div>
        <div class="source-card">Beta <span role="checkbox" aria-checked="false"></span></div>
      </section>
    `;
    document.querySelector("button").addEventListener("click", () => {
      document.querySelectorAll("[role='checkbox']").forEach((checkbox) => {
        checkbox.setAttribute("aria-checked", "true");
      });
    });

    selectAllVisible(document);

    expect(getSelectedRows(document)).toHaveLength(2);
  });

  it("uses Angular Material native checkbox checked state", () => {
    document.body.innerHTML = `
      <section>
        <input type="checkbox" aria-label="Select all sources" class="mdc-checkbox__native-control">
        <div class="source-entry">
          <button class="source-stretched-button" aria-label="Alpha title"></button>
          <button class="source-item-more-button" aria-label="More">more_vert</button>
          <input type="checkbox" class="mdc-checkbox__native-control mdc-checkbox--selected" aria-label="Alpha title" checked>
        </div>
        <div class="source-entry">
          <button class="source-stretched-button" aria-label="Beta title"></button>
          <button class="source-item-more-button" aria-label="More">more_vert</button>
          <input type="checkbox" class="mdc-checkbox__native-control" aria-label="Beta title">
        </div>
      </section>
    `;

    expect(getSelectedRows(document).map((row) => row.querySelector(".source-stretched-button").getAttribute("aria-label"))).toEqual(["Alpha title"]);
  });

  it("clears selected Angular Material source checkboxes", () => {
    document.body.innerHTML = `
      <section>
        <div class="source-entry">
          <button class="source-stretched-button" aria-label="Alpha title"></button>
          <button class="source-item-more-button" aria-label="More">more_vert</button>
          <input type="checkbox" class="mdc-checkbox__native-control mdc-checkbox--selected" aria-label="Alpha title" checked>
        </div>
      </section>
    `;

    clearSelection(document);

    expect(getSelectedRows(document)).toHaveLength(0);
  });

  it("has an importable harness", () => {
    document.body.innerHTML = `
      <aside aria-label="Sources">
        <div role="listitem">Alpha</div>
        <div role="listitem">Beta</div>
      </aside>
    `;
    syncSelectionUi(document);
    selectAllVisible(document);
    expect(getSelectedRows(document)).toHaveLength(2);
    clearSelection(document);
    expect(getSelectedRows(document)).toHaveLength(0);
  });
});
