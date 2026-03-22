import { render, screen, userEvent, waitFor } from "@test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { tinyJpeg, stableUrlsPromise, getSlideshowUrlsPromiseMock } = vi.hoisted(
  () => {
    /** Minimal valid JPEG (1×1) for slideshow src in tests */
    const jpeg =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";
    const urlsRef = { current: Promise.resolve([jpeg]) };
    return {
      tinyJpeg: jpeg,
      stableUrlsPromise: urlsRef,
      getSlideshowUrlsPromiseMock: vi.fn(() => urlsRef.current),
    };
  },
);

vi.mock("@/wedding/slideshow-urls-promise", () => ({
  getSlideshowUrlsPromise: () => getSlideshowUrlsPromiseMock(),
}));

vi.mock("@components/wedding-youtube-audio", () => ({
  WeddingYoutubeAudio: () => null,
}));

import App from "@/app";
import { weddingCopy } from "@/wedding/copy";

describe("App", () => {
  beforeEach(() => {
    stableUrlsPromise.current = Promise.resolve([tinyJpeg]);
  });

  it("shows the invite screen first, then the wedding experience after Begin", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByText(weddingCopy.invite.headlineLineOne.en),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("wedding-overlay")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(weddingCopy.invite.cta.en, "i"),
      }),
    );

    expect(await screen.findByTestId("wedding-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("background-slideshow")).toBeInTheDocument();
    expect(
      screen.getByText(weddingCopy.overlay.venueName.en),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/Add WebP images/i)).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", {
        name: /Open in Google Maps/i,
      }),
    ).toHaveAttribute("href", "https://maps.app.goo.gl/3FYdZH74TRktYm3W9");
    const overlay = screen.getByTestId("wedding-overlay");
    expect(overlay.textContent).toMatch(/2026/);
  });

  it("shows assets hint on the main view when there are no slideshow photos", async () => {
    const user = userEvent.setup();
    stableUrlsPromise.current = Promise.resolve([]);
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(weddingCopy.invite.cta.en, "i"),
      }),
    );
  });

  it("shows loading status after Begin until slideshow URLs resolve", async () => {
    const user = userEvent.setup();
    let resolveUrls!: (urls: string[]) => void;
    stableUrlsPromise.current = new Promise<string[]>((resolve) => {
      resolveUrls = resolve;
    });

    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(weddingCopy.invite.cta.en, "i"),
      }),
    );

    expect(
      await screen.findByRole("status", {}, { timeout: 5_000 }),
    ).toHaveTextContent(/loading/i);
    resolveUrls([tinyJpeg]);
    expect(await screen.findByTestId("wedding-overlay")).toBeInTheDocument();
  });
});
