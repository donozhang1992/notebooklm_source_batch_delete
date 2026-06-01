import { TIMING } from "./config.js";
import { delay, waitFor } from "./wait.js";
import { findConfirmButton, findMenuItem, findRowMenuButton, getSourceTitle } from "./dom.js";

export function createCancellationToken() {
  return {
    cancelled: false,
    cancel() {
      this.cancelled = true;
    }
  };
}

export async function deleteRowsSequentially(rows, options = {}) {
  const result = {
    deleted: [],
    failed: [],
    skipped: [],
    cancelled: false
  };
  const token = options.token || createCancellationToken();

  for (const row of rows) {
    const title = getSourceTitle(row);
    if (token.cancelled) {
      result.cancelled = true;
      result.skipped.push({ title, reason: "cancelled" });
      options.onProgress?.({ phase: "skipped", title, result });
      continue;
    }

    try {
      options.onProgress?.({ phase: "deleting", title, result });
      await deleteOneRow(row, options);
      result.deleted.push({ title });
      options.onProgress?.({ phase: "deleted", title, result });
    } catch (error) {
      result.failed.push({
        title,
        stage: error.stage || "delete",
        message: error.message
      });
      options.onProgress?.({ phase: "failed", title, result });
    }
  }

  if (token.cancelled) result.cancelled = true;
  return result;
}

async function deleteOneRow(row, options) {
  const retryCount = options.retryCount ?? TIMING.retryCount;
  let lastError;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      return await attemptDelete(row, options);
    } catch (error) {
      lastError = error;
      if (attempt < retryCount) await delay(options.actionDelayMs ?? TIMING.actionDelayMs);
    }
  }

  throw lastError;
}

async function attemptDelete(row, options) {
  const click = options.click || ((element) => element.click());
  const root = options.root || document;
  const actionDelayMs = options.actionDelayMs ?? TIMING.actionDelayMs;
  const waitTimeoutMs = options.waitTimeoutMs ?? TIMING.waitTimeoutMs;

  const menuButton = findRowMenuButton(row);
  if (!menuButton) throw stagedError("open-menu", "Could not find source menu button");
  click(menuButton);
  await delay(actionDelayMs);

  const deleteItem = findMenuItem(root);
  if (!deleteItem) throw stagedError("choose-delete", "Could not find delete menu item");
  click(deleteItem);
  await delay(actionDelayMs);

  const confirmButton = findConfirmButton(root);
  if (!confirmButton) throw stagedError("confirm-delete", "Could not find delete confirmation button");
  click(confirmButton);

  await waitFor(() => !row.isConnected, {
    timeoutMs: waitTimeoutMs,
    message: "Source row did not disappear after deletion"
  });
}

function stagedError(stage, message) {
  const error = new Error(message);
  error.stage = stage;
  return error;
}
