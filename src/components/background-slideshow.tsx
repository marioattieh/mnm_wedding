import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useState } from "react";

const INTERVAL_MS = 5_000;

const easeLux = [0.45, 0, 0.2, 1] as const;

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

  useEffect(() => {
    if (urls.length <= 1) {
      return;
    }
    const n = urls.length;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [urls.length]);

  useEffect(() => {
    if (urls.length === 0) {
      return;
    }
    const n = urls.length;
    const nextUrl = urls[(index + 1) % n];
    prefetchSlideImage(nextUrl);
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

function prefetchSlideImage(url: string | undefined): void {
  if (typeof url !== "string" || url.length === 0) {
    return;
  }
  const img = new Image();
  img.src = url;
}
