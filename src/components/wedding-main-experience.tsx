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
      className="app__main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.45, 0, 0.2, 1] }}
    >
      <BackgroundSlideshow urls={slideshowUrls} />
      <div className="app__scrim" aria-hidden />
      <WeddingOverlay />
    </motion.div>
  );
}
