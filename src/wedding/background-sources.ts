const modules = import.meta.glob(
  ["../assets/**/*.webp", "!../assets/landing/**"],
  { import: "default" },
) as Record<string, () => Promise<string>>;

/** Paths under `assets/landing/` are reserved for the invite screen only. */
function isSlideshowAsset(key: string): boolean {
  const normalized = key.replace(/\\/g, "/");
  return !normalized.includes("/landing/");
}

/** Sort by leading digits in the filename (e.g. 100.webp, 110.webp), then by path. */
function slideshowSortKey(path: string): number {
  const base = path.split(/[/\\]/).pop() ?? "";
  const match = /^(\d+)/.exec(base);
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

function compareSlideshowKeys(a: string, b: string): number {
  const na = slideshowSortKey(a);
  const nb = slideshowSortKey(b);
  if (na !== nb) {
    return na - nb;
  }
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function isResolvedAssetUrl(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Resolves slideshow image URLs without eager-loading every file up front.
 * Call from a `useEffect` so the invite screen can paint first; images decode when used in `<img>`.
 */
export async function loadBackgroundImageUrls(): Promise<string[]> {
  const keys = Object.keys(modules)
    .filter(isSlideshowAsset)
    .sort(compareSlideshowKeys);
  const settled = await Promise.all(keys.map((key) => modules[key]()));
  const urls = settled.filter(isResolvedAssetUrl);
  const first = urls[0];
  if (first) {
    prefetchImageUrl(first);
  }
  return urls;
}

/** Warm the browser cache for the first slideshow frame (optional, non-blocking). */
export function prefetchImageUrl(url: string): void {
  if (!isResolvedAssetUrl(url)) {
    return;
  }
  const img = new Image();
  img.src = url;
}
