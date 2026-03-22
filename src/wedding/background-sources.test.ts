import { afterEach, describe, expect, it, vi } from "vitest";

import {
  loadBackgroundImageUrls,
  prefetchImageUrl,
} from "./background-sources";

describe("background-sources", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loadBackgroundImageUrls returns non-empty sorted slideshow URLs", async () => {
    const urls = await loadBackgroundImageUrls();
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every((u) => typeof u === "string" && u.length > 0)).toBe(true);
  });

  it("prefetchImageUrl ignores empty string", () => {
    const ctor = vi
      .spyOn(globalThis, "Image")
      .mockImplementation(() => ({}) as HTMLImageElement);
    prefetchImageUrl("");
    expect(ctor).not.toHaveBeenCalled();
  });

  it("prefetchImageUrl assigns src on a new Image", () => {
    const instances: { src: string }[] = [];
    vi.spyOn(globalThis, "Image").mockImplementation(function () {
      const self = { src: "" };
      instances.push(self);
      return self as unknown as HTMLImageElement;
    });
    prefetchImageUrl("https://example.com/warm.webp");
    expect(instances[0]?.src).toBe("https://example.com/warm.webp");
  });
});
