// Anything from a URL is text that anyone can type, so numbers in it are checked here.
// "12" → 12. "abc", "0", "-3", "2.5", "" and repeated values (["1", "2"]) → null.
export function toPositiveInteger(
  value: string | string[] | undefined,
): number | null {
  if (typeof value !== "string" || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 ? number : null;
}
