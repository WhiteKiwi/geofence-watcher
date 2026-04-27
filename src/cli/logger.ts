let debugEnabled = false;

export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled;
}

export function debug(message: string, ...values: unknown[]): void {
  if (!debugEnabled) {
    return;
  }

  if (values.length === 0) {
    console.error(`[debug] ${message}`);
    return;
  }

  console.error(`[debug] ${message}`, ...values);
}
