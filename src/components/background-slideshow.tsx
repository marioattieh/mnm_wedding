import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const INTERVAL_MS = 4_000;

const easeLux = [0.45, 0, 0.2, 1] as const;

function SlideImagePair({ url }: { url: string }) {
  if (typeof url !== "string" || url.length === 0) {
    return null;
  }
  return (
    <>
      <div className="background-slideshow__fill absolute inset-0" aria-hidden>
        <img
          alt=""
          className="background-slideshow__fill-img block h-full w-full scale-110 object-cover object-center blur-[44px]"
          decoding="async"
          draggable={false}
          src={url}
        />
      </div>
      <div className="background-slideshow__sharp absolute inset-0" aria-hidden>
        <img
          alt=""
          className="background-slideshow__sharp-img block h-full w-full object-cover object-center"
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
        className="background-slideshow background-slideshow--empty absolute inset-0 z-0 bg-ink-950"
        data-testid="background-slideshow"
      />
    );
  }

  if (urls.length === 1) {
    return (
      <div
        className="background-slideshow absolute inset-0 z-0 overflow-hidden"
        data-testid="background-slideshow"
      >
        <motion.div
          aria-hidden
          className="background-slideshow__slide absolute inset-0"
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
    <div
      className="background-slideshow absolute inset-0 z-0 overflow-hidden"
      data-testid="background-slideshow"
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={urls[index]}
          aria-hidden
          className="background-slideshow__slide absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
