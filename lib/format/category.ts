const CATEGORY_ACRONYMS: Record<string, string> = {
  asus: "ASUS",
  hp: "HP",
  usb: "USB",
};

export function formatCategoryName(name: string): string {
  const trimmed = name.trim();
  if (!/[-_]/.test(trimmed)) return trimmed;

  return trimmed
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .map((word) => CATEGORY_ACRONYMS[word.toLowerCase()] ?? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}