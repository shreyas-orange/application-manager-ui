const DATE_LOCALE = "en-GB";

export function normalizeValue(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "NA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString(DATE_LOCALE, { month: "short", year: "numeric" });
}

export function getMonthKey(value: string | null | undefined): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
