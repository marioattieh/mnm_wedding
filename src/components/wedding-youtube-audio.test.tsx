import { act, render, screen, userEvent, waitFor } from "@test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { weddingCopy } from "@/wedding/copy";

import { WeddingYoutubeAudio } from "./wedding-youtube-audio";

describe("WeddingYoutubeAudio", () => {
  beforeEach(() => {
    vi.stubGlobal("YT", undefined as unknown as typeof window.YT | undefined);
    Reflect.deleteProperty(window, "onYouTubeIframeAPIReady");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("initializes the player when YT is already loaded and autoplays when toggle becomes visible", async () => {
    let playerState = 2;
    let onStateChange: ((e: { data: number }) => void) | undefined;

    const target = {
      playVideo: vi.fn(() => {
        playerState = 1;
        onStateChange?.({ data: 1 });
      }),
      pauseVideo: vi.fn(() => {
        playerState = 2;
        onStateChange?.({ data: 2 });
      }),
      seekTo: vi.fn(),
      getCurrentTime: vi.fn(() => 40),
      getPlayerState: vi.fn(() => playerState),
      destroy: vi.fn(),
    };

    window.YT = {
      Player: class {
        constructor(
          _el: HTMLElement,
          opts: { events?: Record<string, (e: unknown) => void> },
        ) {
          onStateChange = opts.events?.onStateChange as typeof onStateChange;
          queueMicrotask(() => {
            opts.events?.onReady?.({ target });
          });
        }
      },
    } as typeof window.YT;

    const { rerender } = render(<WeddingYoutubeAudio showToggle={false} />);

    await waitFor(() => {
      expect(target.seekTo).toHaveBeenCalled();
    });
    expect(target.pauseVideo).toHaveBeenCalled();

    rerender(<WeddingYoutubeAudio showToggle={true} />);

    const toggle = await screen.findByRole("button", {
      name: new RegExp(
        `${weddingCopy.youtubeAudio.play.en}|${weddingCopy.youtubeAudio.pause.en}`,
        "i",
      ),
    });
    await waitFor(() => expect(toggle).not.toBeDisabled());
    expect(target.playVideo).toHaveBeenCalled();
    expect(playerState).toBe(1);

    await userEvent.click(toggle);
    expect(target.pauseVideo).toHaveBeenCalled();

    await userEvent.click(toggle);
    expect(target.playVideo).toHaveBeenCalledTimes(2);
  });

  it("loads the iframe API script when YT.Player is missing", async () => {
    const appendSpy = vi.spyOn(document.head, "appendChild");
    const target = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
      getCurrentTime: vi.fn(() => 40),
      getPlayerState: vi.fn(() => 2),
      destroy: vi.fn(),
    };

    window.YT = {} as typeof window.YT;

    render(<WeddingYoutubeAudio showToggle={false} />);

    await waitFor(() => {
      expect(appendSpy).toHaveBeenCalled();
    });
    const script = appendSpy.mock.calls.find(
      (c) => c[0] instanceof HTMLScriptElement,
    )?.[0] as HTMLScriptElement | undefined;
    expect(script?.src).toContain("youtube.com/iframe_api");

    window.YT = {
      Player: class {
        constructor(
          _el: HTMLElement,
          opts: { events?: Record<string, (e: unknown) => void> },
        ) {
          queueMicrotask(() => {
            opts.events?.onReady?.({ target });
          });
        }
      },
    } as typeof window.YT;

    window.onYouTubeIframeAPIReady?.();

    await waitFor(() => {
      expect(target.seekTo).toHaveBeenCalled();
    });

    appendSpy.mockRestore();
  });

  it("seeks back to loop start when playback passes the loop end", async () => {
    vi.useFakeTimers();

    const target = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
      getCurrentTime: vi.fn(() => 66),
      getPlayerState: vi.fn(() => 1),
      destroy: vi.fn(),
    };

    window.YT = {
      Player: class {
        constructor(
          _el: HTMLElement,
          opts: { events?: Record<string, (e: unknown) => void> },
        ) {
          queueMicrotask(() => {
            opts.events?.onReady?.({ target });
            opts.events?.onStateChange?.({ data: 1 });
          });
        }
      },
    } as typeof window.YT;

    render(<WeddingYoutubeAudio showToggle={true} />);

    await vi.waitFor(() => {
      expect(target.seekTo).toHaveBeenCalled();
    });

    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(target.seekTo).toHaveBeenCalledWith(33, true);

    vi.useRealTimers();
  });
});
