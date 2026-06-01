import { TIMING } from "./config.js";
import { findSourcePanel, getSourceTitle } from "./dom.js";
import { clearSelection, getSelectedRows, selectAllVisible, syncSelectionUi } from "./selection.js";
import { createCancellationToken, deleteRowsSequentially } from "./delete-flow.js";
import { ensureToolbar, showConfirmDialog, showProgress, showSummary } from "./ui.js";

let observer;
let debounceTimer;

export function start(root = document) {
  render(root);
  installDebugProbe(root);

  observer = new MutationObserver(() => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => render(root), TIMING.mutationDebounceMs);
  });
  observer.observe(root.body || root.documentElement, { childList: true, subtree: true });
}

export function stop() {
  observer?.disconnect();
  observer = null;
  window.clearTimeout(debounceTimer);
}

function render(root) {
  const panel = findSourcePanel(root);
  if (!panel) return;

  syncSelectionUi(panel);
  ensureToolbar(panel, {
    onSelectAll: () => selectAllVisible(getActionRoot(root)),
    onClear: () => clearSelection(getActionRoot(root)),
    onDeleteSelected: async () => {
      const actionRoot = getActionRoot(root);
      const rows = getSelectedRows(actionRoot);
      const items = rows.map((row) => ({ title: getSourceTitle(row) }));
      if (rows.length === 0) {
        showSummary({
          deleted: [],
          failed: [{ title: "No selected sources detected", stage: "selection", message: "Select sources in NotebookLM first, then try Delete again." }],
          skipped: [],
          cancelled: false
        });
        return;
      }
      const confirmed = await showConfirmDialog(items);
      if (!confirmed) return;
      const token = createCancellationToken();
      const progress = showProgress({ total: rows.length, onCancel: () => token.cancel() });
      progress.update({ done: 0, total: rows.length });
      const result = await deleteRowsSequentially(rows, {
        root,
        token,
        onProgress: ({ title, result: currentResult }) => {
          progress.update({
            done: currentResult.deleted.length + currentResult.failed.length + currentResult.skipped.length,
            total: rows.length,
            title
          });
        }
      });
      progress.close();
      showSummary(result);
    }
  });
}

if (typeof document !== "undefined") {
  start(document);
}

function installDebugProbe(root) {
  window.nlmbdDebug = () => {
    const panel = findSourcePanel(root);
    if (!panel) return { error: "No source panel detected" };
    const actionRoot = getActionRoot(root);

    const rows = getSelectedRows(actionRoot);
    const checkboxLike = Array.from(actionRoot.querySelectorAll("input[type='checkbox'], [role='checkbox'], [aria-checked], [class*='checkbox' i], [class*='check' i]"))
      .filter((element) => !element.closest("#nlmbd-toolbar, #nlmbd-dialog"))
      .slice(0, 30)
      .map(describeElement);

    const selectAllLike = Array.from(actionRoot.querySelectorAll("button, [role='button'], div, span"))
      .filter((element) => /select all/i.test(element.textContent || element.getAttribute("aria-label") || ""))
      .slice(0, 10)
      .map(describeElement);

    return {
      panel: describeElement(panel),
      actionRoot: describeElement(actionRoot),
      detectedSelectedRows: rows.map((row) => ({ title: getSourceTitle(row), element: describeElement(row) })),
      checkboxLike,
      selectAllLike
    };
  };
}

function describeElement(element) {
  return {
    tag: element.tagName,
    role: element.getAttribute("role"),
    ariaChecked: element.getAttribute("aria-checked"),
    ariaLabel: element.getAttribute("aria-label"),
    checked: "checked" in element ? element.checked : undefined,
    classes: element.className?.toString?.().slice(0, 240) || "",
    text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 180)
  };
}

function getActionRoot(root) {
  const panel = findSourcePanel(root);
  const panelRows = panel ? getSelectedRows(panel) : [];
  const panelHasControls = panel?.querySelector?.("input[type='checkbox'], button.source-stretched-button, button.source-item-more-button");

  if (panel && (panelRows.length > 0 || panelHasControls)) return panel;
  return root;
}
