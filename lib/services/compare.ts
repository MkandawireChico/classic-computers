import "server-only";
import { cookies } from "next/headers";

const COMPARE_COOKIE = "cc_compare";
const MAX_COMPARE = 4;

export function getCompareIdsReadOnly(): string[] {
  const raw = cookies().get(COMPARE_COOKIE)?.value;
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

/** Server Action only (sets a cookie). */
export function toggleCompare(productId: string): string[] {
  const current = getCompareIdsReadOnly();
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId].slice(-MAX_COMPARE);

  cookies().set(COMPARE_COOKIE, next.join(","), {
    httpOnly: false, // read by the compare-button UI to show active state; holds only product ids, nothing sensitive
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return next;
}

/** Server Action only. */
export function clearCompare(): void {
  cookies().delete(COMPARE_COOKIE);
}

export const MAX_COMPARE_ITEMS = MAX_COMPARE;
