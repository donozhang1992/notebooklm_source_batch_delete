import { EXTENSION_CLASSES } from "./config.js";
import { findSourceRows, isVisible } from "./dom.js";

export function ensureRowCheckbox(row) {
  const nativeCheckbox = findNativeCheckbox(row);
  if (nativeCheckbox) return nativeCheckbox;

  const existing = row.querySelector(`:scope > .${EXTENSION_CLASSES.checkbox}`);
  if (existing) return existing;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = EXTENSION_CLASSES.checkbox;
  checkbox.setAttribute("aria-label", "Select source for bulk delete");
  row.prepend(checkbox);
  return checkbox;
}

export function getSelectedRows(root = document) {
  return findSourceRows(root).filter((row) => {
    const checkbox = findSelectionCheckbox(row);
    return isCheckboxChecked(checkbox) && isVisible(row);
  });
}

export function selectAllVisible(root = document) {
  const nativeSelectAll = findNativeSelectAllControl(root);
  if (nativeSelectAll && !areAllNativeRowsSelected(root)) {
    clickCheckbox(nativeSelectAll);
    return;
  }

  for (const row of findSourceRows(root)) {
    setCheckboxChecked(ensureRowCheckbox(row), true);
  }
}

export function clearSelection(root = document) {
  const materialCheckboxes = findMaterialSourceCheckboxes(root).filter(isCheckboxChecked);
  if (materialCheckboxes.length > 0) {
    for (const checkbox of materialCheckboxes) {
      clickCheckbox(checkbox);
    }
    return;
  }

  for (const row of findSourceRows(root)) {
    setCheckboxChecked(findSelectionCheckbox(row), false);
  }
}

export function syncSelectionUi(root = document) {
  for (const row of findSourceRows(root)) {
    ensureRowCheckbox(row);
  }
}

function findSelectionCheckbox(row) {
  return row?.querySelector(`:scope > .${EXTENSION_CLASSES.checkbox}`) || findNativeCheckbox(row);
}

function findNativeCheckbox(row) {
  return row?.querySelector("input[type='checkbox'].mdc-checkbox__native-control:not([aria-label*='Select all' i])")
    || row?.querySelector("input[type='checkbox'], [role='checkbox'], [aria-checked]");
}

function findMaterialSourceCheckboxes(root) {
  return Array.from(root.querySelectorAll("input[type='checkbox'].mdc-checkbox__native-control:not([aria-label*='Select all' i])"))
    .filter((checkbox) => !checkbox.closest("#nlmbd-toolbar, #nlmbd-dialog"));
}

function isCheckboxChecked(checkbox) {
  if (!checkbox) return false;
  if ("checked" in checkbox) return checkbox.checked;
  return checkbox.getAttribute("aria-checked") === "true";
}

function setCheckboxChecked(checkbox, checked) {
  if (!checkbox) return;
  if (isCheckboxChecked(checkbox) === checked) return;

  if (checkbox.classList.contains(EXTENSION_CLASSES.checkbox) && "checked" in checkbox) {
    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  clickCheckbox(checkbox);
}

function clickCheckbox(checkbox) {
  const target = checkbox.matches?.("input[type='checkbox']")
    ? checkbox
    : checkbox.closest("label, button, [role='checkbox'], mat-checkbox, .mat-mdc-checkbox, .mdc-checkbox") || checkbox;
  target.click();
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
}

function findNativeSelectAllControl(root) {
  const selectAllInput = root.querySelector("input[type='checkbox'][aria-label*='Select all sources' i]")
    || document.querySelector("input[type='checkbox'][aria-label*='Select all sources' i]");
  if (selectAllInput) return selectAllInput;

  return Array.from(root.querySelectorAll("button, [role='button'], [role='checkbox'], [aria-checked], input[type='checkbox'], div, span"))
    .find((control) => {
      if (control.closest("#nlmbd-toolbar, #nlmbd-dialog")) return false;
      const text = (control.textContent || control.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      return /^select all$/i.test(text) || /select all/i.test(control.getAttribute("aria-label") || "");
    }) || null;
}

function areAllNativeRowsSelected(root) {
  const rows = findSourceRows(root);
  return rows.length > 0 && rows.every((row) => isCheckboxChecked(findSelectionCheckbox(row)));
}
