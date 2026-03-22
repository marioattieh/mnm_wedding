import { beforeEach, describe, expect, it, vi } from "vitest";

const loadMock = vi.fn(() => Promise.resolve(["/slide-a.webp"]));

vi.mock("@/wedding/background-sources", () => ({
  loadBackgroundImageUrls: () => loadMock(),
}));

describe("getSlideshowUrlsPromise", () => {
  beforeEach(async () => {
    vi.resetModules();
    loadMock.mockClear();
    loadMock.mockImplementation(() => Promise.resolve(["/slide-a.webp"]));
  });

  it("returns the same cached promise across calls", async () => {
    const { getSlideshowUrlsPromise } =
      await import("./slideshow-urls-promise");
    const first = getSlideshowUrlsPromise();
    const second = getSlideshowUrlsPromise();
    expect(second).toBe(first);
    expect(await first).toEqual(["/slide-a.webp"]);
    expect(loadMock).toHaveBeenCalledTimes(1);
  });
});
