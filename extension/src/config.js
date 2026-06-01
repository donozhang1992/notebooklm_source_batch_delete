export const EXTENSION_IDS = {
  toolbar: "nlmbd-toolbar",
  dialog: "nlmbd-dialog"
};

export const EXTENSION_CLASSES = {
  toolbar: "nlmbd-toolbar",
  button: "nlmbd-button",
  dangerButton: "nlmbd-button-danger",
  checkbox: "nlmbd-checkbox",
  dialog: "nlmbd-dialog",
  dialogPanel: "nlmbd-dialog-panel"
};

export const SOURCE_SELECTORS = {
  panelCandidates: [
    "aside[aria-label*='Sources' i]",
    "[role='complementary'][aria-label*='Sources' i]",
    "[data-testid*='source' i]",
    "aside"
  ],
  rowCandidates: [
    "[data-testid*='source' i]",
    "[role='listitem']",
    "li"
  ],
  menuButtonCandidates: [
    "button[aria-label*='More' i]",
    "button[aria-label*='menu' i]",
    "button[aria-haspopup='menu']"
  ],
  deleteLabels: ["Delete", "Remove"],
  confirmLabels: ["Delete", "Remove", "Confirm"]
};

export const TIMING = {
  mutationDebounceMs: 250,
  actionDelayMs: 500,
  waitTimeoutMs: 5_000,
  retryCount: 1
};
