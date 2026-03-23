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

function PlayGlyph() {
  return (
    <svg
      className="wedding-youtube-audio__icon wedding-youtube-audio__icon--play"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <polygon points="8,5 8,19 19,12" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg
      className="wedding-youtube-audio__icon"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
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
    <div className="wedding-youtube-audio">
      <div
        ref={hostRef}
        className="wedding-youtube-audio__player-host"
        title={`${youtubeAudio.iframeTitle.en} — ${youtubeAudio.iframeTitle.ar}`}
      />
      {showToggle ? (
        <button
          type="button"
          className="wedding-youtube-audio__toggle"
          disabled={!ready}
          aria-pressed={playing}
          aria-label={`${playing ? youtubeAudio.pause.en : youtubeAudio.play.en}. ${playing ? youtubeAudio.pause.ar : youtubeAudio.play.ar}`}
          onClick={toggle}
        >
          {playing ? <PauseGlyph /> : <PlayGlyph />}
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
