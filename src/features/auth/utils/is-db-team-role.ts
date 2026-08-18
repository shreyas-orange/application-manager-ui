export function isDbTeamRole(role: string | null | undefined): boolean {
  const normalized = role?.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ") ?? "";
  return normalized === "db manager" || normalized === "db validator";
}
