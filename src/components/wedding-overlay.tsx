import { MapPin } from "lucide-react";

import { weddingCopy } from "@/wedding/copy";

export function WeddingOverlay() {
  const { weddingDate, overlay } = weddingCopy;

  return (
    <div
      className="relative z-20 flex min-h-screen w-full flex-col items-center justify-between px-6 py-8 text-center text-ivory-50"
      data-testid="wedding-overlay"
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="font-['Great_Vibes',cursive] text-[clamp(2.1rem,6vw,3.4rem)] leading-tight"
          lang="en"
        >
          "{overlay.title}"
        </span>
        <span
          className="font-['Open_Sans',system-ui,sans-serif] text-[clamp(1.1rem,3vw,1.6rem)] leading-tight"
          lang="en"
        >
          {overlay.subtitle}
        </span>
        <div className="flex items-center justify-between w-full mt-4 font-['Cormorant_Garamond'] font-bold whitespace-break-spaces">
          <span
            className=" text-[clamp(2.4rem,7vw,3.6rem)] leading-tight"
            lang="en"
          >
            {overlay.groomName}
          </span>
          <span
            className=" text-[clamp(1.5rem,4vw,2.2rem)] leading-tight"
            lang="en"
          >
            {overlay.ampersand}
          </span>
          <span
            className=" text-[clamp(2.4rem,7vw,3.6rem)] leading-tight"
            lang="en"
          >
            {overlay.brideName}
          </span>
        </div>
        <span
          className="font-['Open_Sans',system-ui,sans-serif] text-[clamp(1.5rem,4vw,2.2rem)] leading-tight"
          lang="en"
        >
          {overlay.wedding}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="mb-3">
          <span
            className="font-['Outfit',system-ui,sans-serif] text-[clamp(0.95rem,2.8vw,1.1rem)] tracking-[0.18em] uppercase text-ivory-50/90"
            lang="en"
          >
            {weddingDate}
          </span>
        </div>
        <div className="mb-4 h-px w-24 bg-ivory-50/35" aria-hidden />
        <div className="mb-2">
          <span
            className="font-['Cormorant_Garamond','Times_New_Roman',serif] text-[clamp(2rem,5.7vw,3rem)] leading-tight"
            lang="en"
          >
            {overlay.ceremonyTime}
          </span>
        </div>
        <div className="mb-2">
          <span
            className="font-['Cormorant_Garamond','Times_New_Roman',serif] text-[clamp(1.55rem,4.5vw,2.5rem)] font-semibold leading-tight"
            lang="en"
          >
            {overlay.venueName.en}
          </span>
        </div>
        <a
          className="mt-4 inline-flex min-h-13 max-w-[calc(100vw-2.5rem)] items-center justify-center gap-2 rounded-full border border-ivory-50/40 bg-ivory-50/8 px-5 py-3 font-['Outfit',system-ui,sans-serif] text-[clamp(0.88rem,2.6vw,1.05rem)] font-medium leading-snug text-ivory-50 no-underline shadow-lg shadow-black/45 transition hover:-translate-y-px hover:border-ivory-50/65 hover:bg-ivory-50/14 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory-50/90"
          aria-label="Open in Google Maps"
          href={overlay.mapsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <div className="flex flex-col items-center gap-1">
            <span className="block tracking-[0.06em]" lang="en">
              {overlay.mapsLinkLabel}
            </span>
            <span className="block tracking-[0.06em]" lang="en">
              {overlay.venueName.ar}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
