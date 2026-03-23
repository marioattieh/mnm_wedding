import { MapPin } from "lucide-react";

import { weddingCopy } from "@/wedding/copy";

export function WeddingOverlay() {
  const { weddingDate, overlay } = weddingCopy;

  return (
    <div
      className="relative z-20 flex h-full min-h-dvh max-h-dvh w-full flex-col items-center justify-between overflow-hidden px-4 py-5 text-center text-ivory-50 sm:px-6 sm:py-7"
      data-testid="wedding-overlay"
    >
      <div className="flex flex-col items-center gap-2.5 sm:gap-3">
        <span
          className="font-['Great_Vibes',cursive] text-[clamp(1.8rem,5.1vw,2.9rem)] leading-tight"
          lang="en"
        >
          "{overlay.title}"
        </span>
        <div className="mt-2.5 flex w-full items-center justify-between font-['Cormorant_Garamond'] font-bold whitespace-break-spaces sm:mt-4">
          <span
            className=" text-[clamp(2.05rem,5.95vw,3.05rem)] leading-tight"
            lang="en"
          >
            {overlay.groomName}
          </span>
          <span
            className=" text-[clamp(1.28rem,3.4vw,1.87rem)] leading-tight"
            lang="en"
          >
            {overlay.ampersand}
          </span>
          <span
            className=" text-[clamp(2.05rem,5.95vw,3.05rem)] leading-tight"
            lang="en"
          >
            {overlay.brideName}
          </span>
        </div>
        <span
          className="font-['Open_Sans',system-ui,sans-serif] text-[clamp(0.95rem,2.55vw,1.35rem)] leading-tight"
          lang="en"
        >
          {overlay.subtitle}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span
          className="font-['Outfit',system-ui,sans-serif] text-[clamp(0.8rem,2.35vw,0.93rem)] tracking-[0.16em] uppercase text-ivory-50/90"
          lang="en"
        >
          {weddingDate}
        </span>

        <span
          className="font-['Cormorant_Garamond','Times_New_Roman',serif] text-[clamp(1.1rem,2.4vw,1.4rem)] leading-tight"
          lang="en"
        >
          {overlay.ceremonyTime}
        </span>

        <div
          className="h-px w-full bg-linear-to-r from-transparent via-ivory-50/35 to-transparent"
          aria-hidden
        />

        <span
          className="font-['Cormorant_Garamond','Times_New_Roman',serif] text-[clamp(1.32rem,3.85vw,2.12rem)] font-semibold leading-tight"
          lang="en"
        >
          {overlay.venueName.en}
        </span>

        <a
          className="mt-3 inline-flex min-h-11 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-full border border-ivory-50/40 bg-ivory-50/8 px-4 py-2.5 font-['Outfit',system-ui,sans-serif] text-[clamp(0.75rem,2.2vw,0.9rem)] font-medium leading-snug text-ivory-50 no-underline shadow-lg shadow-black/45 transition hover:-translate-y-px hover:border-ivory-50/65 hover:bg-ivory-50/14 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory-50/90 sm:mt-4 sm:min-h-13 sm:max-w-[calc(100vw-2.5rem)] sm:px-5 sm:py-3 sm:text-[clamp(0.88rem,2.6vw,1.05rem)]"
          aria-label="Open in Google Maps"
          href={overlay.mapsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
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
