import { SOURCE_SELECTORS } from "./config.js";

export function isVisible(element) {
  if (!element || !(element instanceof Element)) return false;
  const style = window.getComputedStyle(element);
  return !element.hidden && style.visibility !== "hidden" && style.display !== "none";
}

export function findSourcePanel(root = document) {
  const explicitPanel = findFirstVisible(root, SOURCE_SELECTORS.panelCandidates, { rejectInteractive: true });
  if (explicitPanel) return explicitPanel;

  return findPanelByVisibleText(root);
}

export function findSourceRows(root = document) {
  const angularMaterialRows = findRowsFromNativeCheckboxes(root);
  if (angularMaterialRows.length > 0) return angularMaterialRows;

  const rows = SOURCE_SELECTORS.rowCandidates.flatMap((selector) => Array.from(root.querySelectorAll(selector)));
  const semanticRows = uniqueElements(rows).filter((row) => isVisible(row) && !hasNestedSourceRow(row));
  if (semanticRows.length > 0) return semanticRows;

  return [];
}

export function getSourceTitle(row) {
  const sourceButtonLabel = row?.querySelector?.("button.source-stretched-button[aria-label]")?.getAttribute("aria-label")?.trim();
  if (sourceButtonLabel) return sourceButtonLabel;

  const checkboxLabel = row?.querySelector?.("input[type='checkbox'].mdc-checkbox__native-control[aria-label]")?.getAttribute("aria-label")?.trim();
  if (checkboxLabel && !/select all sources/i.test(checkboxLabel)) return checkboxLabel;

  const ariaLabel = row?.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel;
  if (!row) return "Untitled source";

  const clone = row.cloneNode(true);
  for (const control of clone.querySelectorAll("button, input, select, textarea, [role='button']")) {
    control.remove();
  }

  return clone.textContent?.trim() || "Untitled source";
}

export function findRowMenuButton(row) {
  return findFirstVisible(row, SOURCE_SELECTORS.menuButtonCandidates, { rejectSourceOpenButton: true });
}

export function findMenuItem(root = document, labels = SOURCE_SELECTORS.deleteLabels) {
  const openMenus = Array.from(root.querySelectorAll("[role='menu']"));
  for (const menu of openMenus.reverse()) {
    const deleteMenuItem = findFirstVisible(menu, SOURCE_SELECTORS.deleteMenuItemCandidates);
    if (deleteMenuItem) return deleteMenuItem;

    const menuItem = findButtonByLabels(menu, labels);
    if (menuItem) return menuItem;
  }

  const deleteMenuItem = findFirstVisible(root, SOURCE_SELECTORS.deleteMenuItemCandidates);
  if (deleteMenuItem) return deleteMenuItem;

  return findButtonByLabels(root, labels);
}

export function findConfirmButton(root = document) {
  return findButtonByLabels(root, SOURCE_SELECTORS.confirmLabels, { reverse: true });
}

function findFirstVisible(root, selectors, options = {}) {
  for (const selector of selectors) {
    const match = Array.from(root.querySelectorAll(selector)).find((element) => {
      if (!isVisible(element)) return false;
      if (options.rejectInteractive && isInteractiveControl(element)) return false;
      if (options.rejectSourceOpenButton && isSourceOpenButton(element)) return false;
      return true;
    });
    if (match) return match;
  }
  return null;
}

function findButtonByLabels(root, labels, options = {}) {
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  const candidates = Array.from(root.querySelectorAll("button, [role='menuitem'], [role='button']"));
  if (options.reverse) candidates.reverse();
  return candidates.find((candidate) => {
    if (!isVisible(candidate)) return false;
    if (candidate.closest("#nlmbd-toolbar, #nlmbd-dialog")) return false;
    const text = (candidate.textContent || candidate.getAttribute("aria-label") || "").trim().toLowerCase();
    return normalizedLabels.some((label) => text.includes(label));
  }) || null;
}

function uniqueElements(elements) {
  return Array.from(new Set(elements));
}

function hasNestedSourceRow(row) {
  return SOURCE_SELECTORS.rowCandidates.some((selector) => {
    try {
      return Array.from(row.querySelectorAll(selector)).some((candidate) => candidate !== row);
    } catch {
      return false;
    }
  });
}

function findPanelByVisibleText(root) {
  const candidates = Array.from(root.querySelectorAll("section, aside, nav, div"))
    .filter((element) => {
      if (!isVisible(element) || isInteractiveControl(element)) return false;
      const text = normalizeText(element.textContent);
      return /\bSources\b/i.test(text) && /\bAdd sources\b/i.test(text);
    })
    .sort((a, b) => normalizeText(a.textContent).length - normalizeText(b.textContent).length);

  return candidates[0] || null;
}

function isInteractiveControl(element) {
  return element.matches("button, input, select, textarea, [role='button'], [role='checkbox'], [role='menuitem']");
}

function isSourceOpenButton(element) {
  return element.matches("button.source-stretched-button, button.source-stretched-button *");
}

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function findRowsFromNativeCheckboxes(root) {
  const controls = Array.from(root.querySelectorAll("input[type='checkbox'], [role='checkbox'], [aria-checked]"));
  const rows = controls
    .filter((control) => !control.closest("#nlmbd-toolbar, #nlmbd-dialog"))
    .filter((control) => !isSelectAllCheckbox(control))
    .map((control) => closestSourceRowForCheckbox(control))
    .filter(Boolean);

  return uniqueElements(rows);
}

function closestSourceRowForCheckbox(control) {
  const angularSourceRow = closestAngularMaterialSourceRow(control);
  if (angularSourceRow) return angularSourceRow;

  let current = control.parentElement;

  while (current && current !== document.body) {
    const text = normalizeText(current.textContent);
    if (/^select all$/i.test(text)) return null;

    const hasMeaningfulTitle = text.length >= 4 && !/^select all$/i.test(text);
    const isSearchOrToolbar = /Search the web for new sources/i.test(text) || /Add sources/i.test(text);

    if (hasMeaningfulTitle && !isSearchOrToolbar && isVisible(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function closestAngularMaterialSourceRow(control) {
  if (!control.matches("input[type='checkbox'].mdc-checkbox__native-control")) return null;

  let current = control.parentElement;
  while (current && current !== document.body) {
    const sourceButton = current.querySelector("button.source-stretched-button[aria-label]");
    const moreButton = current.querySelector("button.source-item-more-button, button[aria-label='More']");
    const sourceCheckbox = current.querySelector("input[type='checkbox'].mdc-checkbox__native-control:not([aria-label*='Select all' i])");

    if (sourceButton && moreButton && sourceCheckbox) return current;
    current = current.parentElement;
  }

  return null;
}

function isSelectAllCheckbox(control) {
  return /select all sources/i.test(control.getAttribute("aria-label") || "");
}
