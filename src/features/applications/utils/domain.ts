export function sanitizeDomainName(
  domain: string | null | undefined,
): string | null {
  const value = domain?.trim() ?? "";
  const placeholder = value.toLowerCase().replace(/[#/\.\s]/g, "");

  if (!value || placeholder === "na" || /^\d+$/.test(value)) {
    return null;
  }

  return value;
}
