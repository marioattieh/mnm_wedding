import { Pause as PauseIcon, Play as PlayIcon } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { weddingCopy } from "@/wedding/copy";

/** Official video — audio played via YouTube embed (video hidden). */
const YOUTUBE_VIDEO_ID = "GxldQ9eX2wo";

/** Loop this slice of the track (seconds). */
const LOOP_START_SEC = 33;
const LOOP_END_SEC = 65;

/** https://developers.google.com/youtube/iframe_api_reference#Playback_status */
const YT_PLAYING = 1;
const YT_PAUSED = 2;

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let iframeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  if (window.YT?.Player) {
    return Promise.resolve();
  }
  iframeApiPromise ??= new Promise<void>((resolve, reject) => {
    const prior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prior?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => reject(new Error("YouTube iframe API failed to load"));
    document.head.appendChild(tag);
  });
  return iframeApiPromise;
}

function WeddingYoutubeAudioImpl(
  {
    showToggle,
  }: {
    /** When false, only the hidden player loads (e.g. on the invite screen). */
    showToggle: boolean;
  },
  ref: ForwardedRef<WeddingYoutubeAudioHandle>,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const autoplayMainOnceRef = useRef(false);
  const { youtubeAudio } = weddingCopy;
  const playFromGesture = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      return false;
    }
    const t = p.getCurrentTime();
    if (!Number.isFinite(t) || t < LOOP_START_SEC || t >= LOOP_END_SEC) {
      p.seekTo(LOOP_START_SEC, true);
    }
    p.playVideo();
    return true;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      playFromUserGesture: playFromGesture,
    }),
    [playFromGesture],
  );

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }
    let cancelled = false;

    const setup = async () => {
      try {
        await loadYouTubeIframeApi();
      } catch {
        return;
      }
      if (cancelled || !hostRef.current || !window.YT?.Player) {
        return;
      }
      new window.YT.Player(hostRef.current, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          playsinline: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          start: LOOP_START_SEC,
        },
        events: {
          onReady: (e) => {
            if (!cancelled) {
              playerRef.current = e.target;
              e.target.seekTo(LOOP_START_SEC, true);
              e.target.pauseVideo();
              setReady(true);
            }
          },
          onStateChange: (e) => {
            if (cancelled) {
              return;
            }
            if (e.data === YT_PLAYING) {
              setPlaying(true);
            } else if (e.data === YT_PAUSED) {
              setPlaying(false);
            }
          },
        },
      });
    };

    void setup();

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!showToggle) {
      autoplayMainOnceRef.current = false;
      playerRef.current?.pauseVideo();
      setPlaying(false);
      return;
    }
    if (!ready) {
      return;
    }
    if (autoplayMainOnceRef.current) {
      return;
    }
    autoplayMainOnceRef.current = true;
    if (!playerRef.current) {
      return;
    }
    playFromGesture();
  }, [showToggle, ready, playFromGesture]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) {
        return;
      }
      const t = p.getCurrentTime();
      if (Number.isFinite(t) && t >= LOOP_END_SEC) {
        p.seekTo(LOOP_START_SEC, true);
      }
    }, 200);
    return () => clearInterval(id);
  }, [playing]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      return;
    }
    if (p.getPlayerState() === YT_PLAYING) {
      p.pauseVideo();
    } else {
      const t = p.getCurrentTime();
      if (!Number.isFinite(t) || t < LOOP_START_SEC || t >= LOOP_END_SEC) {
        p.seekTo(LOOP_START_SEC, true);
      }
      p.playVideo();
    }
  }, []);

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-4 flex flex-col items-end">
      <div
        ref={hostRef}
        className="pointer-events-none absolute top-0 left-[-9999px] h-[113px] w-[200px] opacity-[0.02]"
        title={`${youtubeAudio.iframeTitle.en} — ${youtubeAudio.iframeTitle.ar}`}
      />
      {showToggle ? (
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory-50/38 bg-ink-950/45 p-0 text-ivory-50 shadow-lg shadow-black/45 backdrop-blur-[10px] transition hover:border-ivory-50/55 hover:bg-ivory-50/12 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ivory-50/85"
          disabled={!ready}
          aria-pressed={playing}
          aria-label={`${playing ? youtubeAudio.pause.en : youtubeAudio.play.en}. ${playing ? youtubeAudio.pause.ar : youtubeAudio.play.ar}`}
          onClick={toggle}
        >
          {playing ? (
            <PauseIcon className="block h-[1.2rem] w-[1.2rem]" aria-hidden />
          ) : (
            <PlayIcon
              className="block h-[1.2rem] w-[1.2rem] translate-x-[2px]"
              aria-hidden
            />
          )}
        </button>
      ) : null}
    </div>
  );
}

export interface WeddingYoutubeAudioHandle {
  playFromUserGesture: () => boolean;
}

export const WeddingYoutubeAudio = forwardRef(WeddingYoutubeAudioImpl);
WeddingYoutubeAudio.displayName = "WeddingYoutubeAudio";
