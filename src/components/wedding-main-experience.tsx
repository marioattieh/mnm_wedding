import { BackgroundSlideshow } from "@components/background-slideshow";
import { WeddingOverlay } from "@components/wedding-overlay";
import { motion } from "framer-motion";

export default function WeddingMainExperience({
  slideshowUrls,
}: {
  slideshowUrls: string[];
}) {
  return (
    <motion.div
      className="relative isolate h-dvh min-h-dvh max-h-dvh w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.45, 0, 0.2, 1] }}
    >
      <BackgroundSlideshow urls={slideshowUrls} />
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-radial from-ink-950/22 via-ink-950/58 to-ink-950/88"
        aria-hidden
      />
      <WeddingOverlay />
    </motion.div>
  );
}
