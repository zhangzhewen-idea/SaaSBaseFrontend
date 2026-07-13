export function normalizePermission(permission: string): string {
  return permission
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
}
