import { EXTENSION_CLASSES, EXTENSION_IDS } from "./config.js";

export function ensureToolbar(root = document, callbacks = {}) {
  const existing = document.getElementById(EXTENSION_IDS.toolbar);
  if (existing) return existing;

  const toolbar = document.createElement("section");
  toolbar.id = EXTENSION_IDS.toolbar;
  toolbar.className = EXTENSION_CLASSES.toolbar;
  toolbar.setAttribute("aria-label", "NotebookLM bulk source delete tools");

  toolbar.append(
    createButton("All", callbacks.onSelectAll, false, "Select all visible sources"),
    createButton("Clear", callbacks.onClear),
    createButton("Delete", callbacks.onDeleteSelected, true, "Delete selected sources"),
    createVersionBadge()
  );

  insertToolbar(root, toolbar);
  return toolbar;
}

export function showConfirmDialog(items = []) {
  return new Promise((resolve) => {
    const dialog = createDialog("Delete selected sources?");
    const list = document.createElement("ul");
    list.className = "nlmbd-source-list";
    for (const item of items) {
      const li = document.createElement("li");
      li.textContent = item.title;
      list.append(li);
    }

    const message = document.createElement("p");
    message.textContent = `This removes ${items.length} source(s) from the current notebook. Original Drive files are not deleted.`;

    const actions = document.createElement("div");
    actions.className = "nlmbd-actions";
    const cancel = createButton("Cancel", () => close(false));
    const confirm = createButton("Delete", () => close(true), true);
    confirm.dataset.nlmbdConfirmDelete = "true";
    actions.append(cancel, confirm);

    dialog.panel.append(message, list, actions);
    document.body.append(dialog.overlay);
    confirm.focus();

    function close(value) {
      dialog.overlay.remove();
      resolve(value);
    }
  });
}

export function showProgress(state = {}) {
  const dialog = createDialog("Deleting sources");
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const cancel = createButton("Cancel", () => {
    state.onCancel?.();
    cancel.disabled = true;
    cancel.textContent = "Cancelling...";
  });
  cancel.dataset.nlmbdCancelDelete = "true";

  dialog.panel.append(status, cancel);
  document.body.append(dialog.overlay);

  return {
    update(nextState = {}) {
      const done = nextState.done ?? 0;
      const total = nextState.total ?? state.total ?? 0;
      const title = nextState.title ? `: ${nextState.title}` : "";
      status.textContent = `${done} / ${total}${title}`;
    },
    close() {
      dialog.overlay.remove();
    }
  };
}

export function showSummary(result = {}) {
  const dialog = createDialog("Bulk delete complete");
  const summary = document.createElement("p");
  const deleted = result.deleted?.length ?? 0;
  const failed = result.failed?.length ?? 0;
  const skipped = result.skipped?.length ?? 0;
  summary.textContent = `Deleted: ${deleted}. Failed: ${failed}. Skipped: ${skipped}.`;
  const close = createButton("Close", () => dialog.overlay.remove());
  dialog.panel.append(summary, close);
  document.body.append(dialog.overlay);
}

export function removeExtensionUi(root = document) {
  root.querySelector(`#${EXTENSION_IDS.toolbar}`)?.remove();
  root.querySelector(`#${EXTENSION_IDS.dialog}`)?.remove();
}

function createButton(label, onClick, danger = false, title = label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${EXTENSION_CLASSES.button}${danger ? ` ${EXTENSION_CLASSES.dangerButton}` : ""}`;
  button.textContent = label;
  button.title = title;
  if (onClick) button.addEventListener("click", onClick);
  return button;
}

function createVersionBadge() {
  const badge = document.createElement("span");
  badge.className = "nlmbd-version";
  badge.textContent = "v0.1.7";
  badge.title = "NotebookLM bulk delete extension build marker";
  return badge;
}

function insertToolbar(root, toolbar) {
  for (const duplicate of document.querySelectorAll(`#${EXTENSION_IDS.toolbar}`)) {
    duplicate.remove();
  }

  const addSourcesButton = Array.from(root.querySelectorAll("button"))
    .find((button) => /\bAdd sources\b/i.test(button.textContent || button.getAttribute("aria-label") || ""));

  if (addSourcesButton?.parentElement) {
    addSourcesButton.parentElement.insertAdjacentElement("afterend", toolbar);
    return;
  }

  root.prepend(toolbar);
}

function createDialog(titleText) {
  document.querySelector(`#${EXTENSION_IDS.dialog}`)?.remove();

  const overlay = document.createElement("div");
  overlay.id = EXTENSION_IDS.dialog;
  overlay.className = EXTENSION_CLASSES.dialog;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const panel = document.createElement("div");
  panel.className = EXTENSION_CLASSES.dialogPanel;
  const title = document.createElement("h2");
  title.textContent = titleText;
  panel.append(title);
  overlay.append(panel);

  return { overlay, panel };
}
