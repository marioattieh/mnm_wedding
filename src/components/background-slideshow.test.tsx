import { render, screen, waitFor } from "@test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BackgroundSlideshow } from "./background-slideshow";

const jpegA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";
const jpegB =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

describe("BackgroundSlideshow", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders empty state when there are no URLs", () => {
    const { container } = render(<BackgroundSlideshow urls={[]} />);
    expect(screen.getByTestId("background-slideshow")).toHaveClass(
      "background-slideshow--empty",
    );
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders a single slide without advancing timers", () => {
    const { container } = render(<BackgroundSlideshow urls={[jpegA]} />);
    expect(screen.getByTestId("background-slideshow")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("advances to the next slide on the interval when multiple URLs are provided", async () => {
    const { container } = render(<BackgroundSlideshow urls={[jpegA, jpegB]} />);
    expect(screen.getByTestId("background-slideshow")).toBeInTheDocument();

    const sharpSrc = () =>
      container
        .querySelector(".background-slideshow__sharp-img")
        ?.getAttribute("src");
    expect(sharpSrc()).toBe(jpegA);

    await waitFor(
      () => {
        expect(sharpSrc()).toBe(jpegB);
      },
      { timeout: 6_500 },
    );
  }, 8_000);
});
