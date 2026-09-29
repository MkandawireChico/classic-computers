/**
 * Joins class names, filtering out falsy values. Deliberately minimal
 * (no clsx/tailwind-merge dependency yet) to keep Phase 1 dependencies
 * small — swap in a merge-aware version later if class conflicts appear.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
