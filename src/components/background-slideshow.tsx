import type { Variants } from "framer-motion";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const INTERVAL_MS = 5_000;

const easeLux = [0.45, 0, 0.2, 1] as const;
const easeOutSoft = [0.16, 1, 0.3, 1] as const;

/** Bitmap ready for display; shared across preload. */
const imageReadyByUrl = new Map<string, Promise<void>>();

function ensureImageReady(url: string): Promise<void> {
  if (typeof url !== "string" || url.length === 0) {
    return Promise.resolve();
  }
  const cached = imageReadyByUrl.get(url);
  if (cached) {
    return cached;
  }
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

interface SlideshowVariantSet {
  slide: Variants;
  fillWrap: Variants;
  sharpWrap: Variants;
}

function createSlideshowVariants(reduceMotion: boolean): SlideshowVariantSet {
  if (reduceMotion) {
    const t = 0.22;
    const ease = easeLux;
    return {
      slide: {
        inactive: {
          opacity: 0,
          y: 0,
          rotateZ: 0,
          transition: { duration: t, ease },
        },
        active: {
          opacity: 1,
          y: 0,
          rotateZ: 0,
          transition: { duration: t, ease },
        },
      },
      fillWrap: {
        inactive: { opacity: 0, transition: { duration: t, ease } },
        active: { opacity: 1, transition: { duration: t, ease } },
      },
      sharpWrap: {
        inactive: { opacity: 0, transition: { duration: t, ease } },
        active: { opacity: 1, transition: { duration: t, ease } },
      },
    };
  }

  const exitDur = 0.88;
  const slideInOpacityDur = 1.28;
  const springSlide = {
    type: "spring" as const,
    stiffness: 62,
    damping: 23,
    mass: 0.92,
  };
  return {
    slide: {
      inactive: {
        opacity: 0,
        y: "1.6%",
        rotateZ: 0.4,
        transition: {
          opacity: { duration: exitDur, ease: easeLux },
          y: { duration: exitDur * 0.92, ease: easeOutSoft },
          rotateZ: { duration: exitDur * 0.92, ease: easeOutSoft },
        },
      },
      active: {
        opacity: 1,
        y: 0,
        rotateZ: 0,
        transition: {
          opacity: { duration: slideInOpacityDur, ease: easeLux },
          y: springSlide,
          rotateZ: springSlide,
          staggerChildren: 0.13,
          delayChildren: 0.06,
        },
      },
    },
    fillWrap: {
      inactive: {
        opacity: 0,
        transition: {
          opacity: { duration: exitDur * 0.9, ease: easeLux },
        },
      },
      active: {
        opacity: 1,
        transition: {
          opacity: { duration: 1.05, ease: easeLux, delay: 0.02 },
        },
      },
    },
    sharpWrap: {
      inactive: {
        opacity: 0,
        transition: {
          opacity: { duration: exitDur * 0.88, ease: easeLux },
        },
      },
      active: {
        opacity: [0, 0.22, 1],
        transition: {
          opacity: {
            duration: 1.42,
            times: [0, 0.2, 1],
            ease: easeLux,
          },
        },
      },
    },
  };
}

function SlideLayers({
  url,
  variants,
}: {
  url: string;
  variants: Pick<SlideshowVariantSet, "fillWrap" | "sharpWrap">;
}) {
  if (typeof url !== "string" || url.length === 0) {
    return null;
  }
  return (
    <>
      <motion.div
        aria-hidden
        className="background-slideshow__fill"
        variants={variants.fillWrap}
      >
        <img
          alt=""
          className="background-slideshow__fill-img"
          decoding="async"
          draggable={false}
          fetchPriority="low"
          src={url}
        />
      </motion.div>
      <motion.div
        aria-hidden
        className="background-slideshow__sharp"
        variants={variants.sharpWrap}
      >
        <img
          alt=""
          className="background-slideshow__sharp-img"
          decoding="async"
          draggable={false}
          fetchPriority="high"
          src={url}
        />
      </motion.div>
    </>
  );
}

interface BackgroundSlideshowProps {
  urls: string[];
}

export function BackgroundSlideshow({ urls }: BackgroundSlideshowProps) {
  const reduceMotion = useReducedMotion();
  const urlsKey = urls.join("\0");
  const [index, setIndex] = useState(0);
  const [preloaded, setPreloaded] = useState(() => urls.length <= 1);

  const variants = useMemo(
    () => createSlideshowVariants(!!reduceMotion),
    [reduceMotion],
  );

  useEffect(() => {
    setIndex(0);
  }, [urlsKey]);

  useEffect(() => {
    if (urls.length <= 1) {
      setPreloaded(true);
      return;
    }
    setPreloaded(false);
    let cancelled = false;
    void Promise.all(urls.map((u) => ensureImageReady(u))).then(() => {
      if (!cancelled) {
        setPreloaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [urlsKey, urls.length, urls]);

  useEffect(() => {
    if (!preloaded || urls.length <= 1) {
      return;
    }
    const n = urls.length;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [preloaded, urls.length, urlsKey]);

  if (urls.length === 0) {
    return (
      <div
        aria-hidden
        className="background-slideshow background-slideshow--empty"
        data-testid="background-slideshow"
      />
    );
  }

  const motionMode = reduceMotion ? "always" : "user";

  if (urls.length === 1) {
    return (
      <MotionConfig reducedMotion={motionMode}>
        <div
          className="background-slideshow"
          data-testid="background-slideshow"
        >
          <motion.div
            aria-hidden
            className="background-slideshow__slide background-slideshow__slide--active"
            data-active="true"
            initial="inactive"
            animate="active"
            variants={variants.slide}
          >
            <SlideLayers url={urls[0]} variants={variants} />
          </motion.div>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion={motionMode}>
      <div className="background-slideshow" data-testid="background-slideshow">
        {urls.map((url, i) => (
          <motion.div
            key={url}
            aria-hidden
            layout={false}
            className={`background-slideshow__slide${i === index ? " background-slideshow__slide--active" : ""}`}
            data-active={i === index ? "true" : "false"}
            initial={false}
            animate={i === index ? "active" : "inactive"}
            variants={variants.slide}
            style={{ zIndex: i === index ? 2 : 1 }}
          >
            <SlideLayers url={url} variants={variants} />
          </motion.div>
        ))}
      </div>
    </MotionConfig>
  );
}
