export function resolveLoreLinkTitle(url: string, override = '', autoTitle = ''): string {
  return override.trim() || autoTitle.trim() || new URL(url.trim()).hostname;
}