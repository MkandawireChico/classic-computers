export function getOrCreateSubmissionKey(formKey: string): string {
  const storageKey = `classic-computers:submission:${formKey}`;
  try {
    if (window.sessionStorage.getItem(`${storageKey}:completed`) === "true") {
      window.sessionStorage.removeItem(`${storageKey}:completed`);
      const next = globalThis.crypto.randomUUID();
      window.sessionStorage.setItem(storageKey, next);
      return next;
    }
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const created = globalThis.crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, created);
    return created;
  } catch {
    return globalThis.crypto.randomUUID();
  }
}

export function markSubmissionComplete(formKey: string): void {
  try {
    window.sessionStorage.setItem(`classic-computers:submission:${formKey}:completed`, "true");
  } catch {
    // The current request is already saved; storage is only for retry UX.
  }
}

export function renewSubmissionKey(formKey: string): string {
  const storageKey = `classic-computers:submission:${formKey}`;
  const created = globalThis.crypto.randomUUID();
  try {
    window.sessionStorage.removeItem(`${storageKey}:completed`);
    window.sessionStorage.setItem(storageKey, created);
  } catch {
    return created;
  }
  return created;
}
