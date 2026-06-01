export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitFor(check, options = {}) {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const intervalMs = options.intervalMs ?? 100;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const value = await check();
    if (value) return value;
    await delay(intervalMs);
  }

  throw new Error(options.message || "Timed out waiting for condition");
}

