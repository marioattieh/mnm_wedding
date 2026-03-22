import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useRef, useState } from "react";

const INTERVAL_MS = 5_000;

const easeLux = [0.45, 0, 0.2, 1] as const;

/** Bitmap ready for display; shared across prefetch and slide transitions. */
const imageReadyByUrl = new Map<string, Promise<void>>();

function ensureImageReady(url: string): Promise<void> {
  if (typeof url !== "string" || url.length === 0) {
    return Promise.resolve();
  }
  const cached = imageReadyByUrl.get(url);
  if (cached) {
    return cached;
  }
  // jsdom does not reliably fire `load` / finish `decode()` on `Image()`; advance timers in tests.
  if (import.meta.env.VITEST) {
    const instant = Promise.resolve();
    imageReadyByUrl.set(url, instant);
    return instant;
  }
  const promise = new Promise<void>((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };
    img.onload = () => {
      const decode =
        "decode" in img && typeof img.decode === "function"
          ? img.decode().catch(() => undefined)
          : Promise.resolve();
      void Promise.race([
        decode,
        new Promise<void>((r) => {
          window.setTimeout(r, 200);
        }),
      ]).finally(finish);
    };
    img.onerror = () => {
      finish();
    };
    img.src = url;
  });
  imageReadyByUrl.set(url, promise);
  return promise;
}

function SlideImagePair({ url }: { url: string }) {
  if (typeof url !== "string" || url.length === 0) {
    return null;
  }
  return (
    <>
      <div className="background-slideshow__fill" aria-hidden>
        <img
          alt=""
          className="background-slideshow__fill-img"
          decoding="async"
          draggable={false}
          fetchPriority="low"
          src={url}
        />
      </div>
      <div
        className="background-slideshow__sharp"
        aria-hidden
        style={
          {
            "--slideshow-zoom-duration": `${INTERVAL_MS * 0.8}ms`,
          } as CSSProperties
        }
      >
        <img
          alt=""
          className="background-slideshow__sharp-img"
          decoding="async"
          draggable={false}
          fetchPriority="high"
          src={url}
        />
      </div>
    </>
  );
}

interface BackgroundSlideshowProps {
  urls: string[];
}

export function BackgroundSlideshow({ urls }: BackgroundSlideshowProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (urls.length <= 1) {
      return;
    }
    const n = urls.length;
    let cancelled = false;
    let timeoutId: number | undefined;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        void run();
      }, INTERVAL_MS);
    };

    async function run() {
      if (cancelled) {
        return;
      }
      const i = indexRef.current;
      const nextUrl = urls[(i + 1) % n];
      await ensureImageReady(nextUrl);
      if (cancelled) {
        return;
      }
      setIndex((prev) => (prev + 1) % n);
      schedule();
    }

    schedule();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [urls]);

  useEffect(() => {
    if (urls.length === 0) {
      return;
    }
    const n = urls.length;
    const nextUrl = urls[(index + 1) % n];
    void ensureImageReady(nextUrl);
  }, [index, urls]);

  if (urls.length === 0) {
    return (
      <div
        aria-hidden
        className="background-slideshow background-slideshow--empty"
        data-testid="background-slideshow"
      />
    );
  }

  if (urls.length === 1) {
    return (
      <div className="background-slideshow" data-testid="background-slideshow">
        <motion.div
          aria-hidden
          className="background-slideshow__slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduceMotion ? 0.2 : 1.1,
            ease: easeLux,
          }}
        >
          <SlideImagePair url={urls[0]} />
        </motion.div>
      </div>
    );
  }

  const duration = reduceMotion ? 0.22 : 1.05;

  return (
    <div className="background-slideshow" data-testid="background-slideshow">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={urls[index]}
          aria-hidden
          className="background-slideshow__slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration,
            ease: easeLux,
          }}
        >
          <SlideImagePair url={urls[index]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
