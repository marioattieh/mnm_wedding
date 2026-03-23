import landingUrl from "@assets/landing/landing.webp";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { weddingCopy } from "@/wedding/copy";

interface WeddingInviteScreenProps {
  onFinished: () => void;
  onBegin?: () => void;
}

const sparkles = [
  { left: "12%", top: "18%", delay: 0 },
  { left: "78%", top: "22%", delay: 0.4 },
  { left: "64%", top: "72%", delay: 0.8 },
  { left: "22%", top: "68%", delay: 1.2 },
] as const;

export function WeddingInviteScreen({
  onFinished,
  onBegin,
}: WeddingInviteScreenProps) {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(mouseX, { stiffness: 22, damping: 18 });
  const parallaxY = useSpring(mouseY, { stiffness: 22, damping: 18 });

  const { invite } = weddingCopy;
  const ctaAriaLabel = `${invite.cta}`;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set((e.clientX - cx) * 0.055);
      mouseY.set((e.clientY - cy) * 0.055);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, reduceMotion]);

  const handleBegin = useCallback(() => {
    onBegin?.();
    setVisible(false);
  }, [onBegin]);

  const headlineStagger = reduceMotion ? 0 : 0.14;
  const childDuration = reduceMotion ? 0.2 : 1.25;

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {visible ? (
        <motion.div
          key="wedding-invite-root"
          aria-labelledby="wedding-invite-heading"
          className="fixed inset-0 z-10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0.22 } }
              : {
                  opacity: 0,
                  scale: 1.07,
                  filter: "blur(16px)",
                  transition: { duration: 0.88, ease: [0.45, 0, 0.2, 1] },
                }
          }
          transition={{ duration: 0.5, ease: [0.45, 0, 0.2, 1] }}
        >
          <div className="absolute inset-0" aria-hidden>
            <img
              alt=""
              className="block h-full w-full scale-110 object-cover object-center blur-[44px]"
              decoding="async"
              draggable={false}
              src={landingUrl}
            />
          </div>
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
          >
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{
                x: parallaxX,
                y: parallaxY,
              }}
            >
              <img
                alt=""
                className="block h-full w-full object-cover object-center"
                decoding="async"
                draggable={false}
                src={landingUrl}
              />
            </motion.div>
          </motion.div>
          <div
            className="pointer-events-none absolute inset-0 bg-radial from-ink-950/18 via-ink-950/56 to-ink-950/88"
            aria-hidden
          />
          {!reduceMotion
            ? sparkles.map((s) => (
                <motion.span
                  key={`${s.left}-${s.top}`}
                  aria-hidden
                  className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-ivory-50/90 shadow-lg shadow-ivory-50/80"
                  style={{ left: s.left, top: s.top }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.9, 0.35, 0.85, 0],
                    scale: [0.4, 1, 0.7, 1.05, 0.5],
                  }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    delay: s.delay,
                    ease: "easeInOut",
                  }}
                />
              ))
            : null}
          <motion.div
            className="pointer-events-none absolute inset-5 rounded-4xl border border-ivory-50/25 md:inset-8"
            aria-hidden
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.9 }}
          />
          <div className="relative z-1 flex min-h-screen flex-col items-center justify-center px-6 text-center text-ivory-50">
            <motion.div
              id="wedding-invite-heading"
              className="mb-10"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: headlineStagger,
                    delayChildren: reduceMotion ? 0 : 0.2,
                  },
                },
              }}
            >
              <motion.span
                className="block font-['Cormorant_Garamond','Times_New_Roman',serif] text-[clamp(2.1rem,6.8vw,4.6rem)] leading-[1.08] tracking-[0.02em] drop-shadow-xl"
                lang="en"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: reduceMotion ? 0 : 28,
                    rotate: reduceMotion ? 0 : -1,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                    transition: {
                      duration: childDuration,
                      ease: [0.45, 0, 0.2, 1],
                    },
                  },
                }}
              >
                {invite.headlineLineOne}
              </motion.span>
            </motion.div>
            <motion.div
              className="mt-2"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduceMotion ? 0.1 : 0.95,
                duration: reduceMotion ? 0.2 : 1.25,
                ease: [0.45, 0, 0.2, 1],
              }}
            >
              <motion.button
                type="button"
                className="group relative inline-flex min-h-13 items-center justify-center overflow-hidden rounded-full border border-ivory-50/45 bg-ivory-50/10 px-7 py-3 font-['Outfit',system-ui,sans-serif] font-medium tracking-[0.14em] text-ivory-50 uppercase shadow-lg shadow-black/45 backdrop-blur-sm hover:border-ivory-50/55 hover:bg-ivory-50/14"
                aria-label={ctaAriaLabel}
                onClick={handleBegin}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.04,
                      }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-ivory-50/20 to-transparent opacity-70"
                  aria-hidden
                />
                <span className="relative z-1">
                  <span lang="en">{invite.cta}</span>
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
