import { loadBackgroundImageUrls } from "@/wedding/background-sources";

let cached: Promise<string[]> | null = null;

/** Single shared promise so `use()` in React stays stable across re-renders. */
export function getSlideshowUrlsPromise(): Promise<string[]> {
  cached ??= loadBackgroundImageUrls();
  return cached;
}
