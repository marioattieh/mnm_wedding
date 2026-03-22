import { BilingualBlock } from "@components/bilingual-text";

import { weddingCopy } from "@/wedding/copy";

export function WeddingOverlay() {
  const { weddingDate, overlay } = weddingCopy;

  return (
    <div className="wedding-overlay" data-testid="wedding-overlay">
      <div className="wedding-overlay__date-block">
        <BilingualBlock
          className="wedding-overlay__date-bilingual"
          text={weddingDate}
        />
      </div>
      <div className="wedding-overlay__divider" aria-hidden />
      <div className="wedding-overlay__label-block">
        <BilingualBlock
          className="wedding-overlay__label-bilingual"
          text={overlay.ceremonyLabel}
        />
      </div>
      <div className="wedding-overlay__time-block">
        <BilingualBlock
          className="wedding-overlay__time-bilingual"
          text={overlay.ceremonyTime}
        />
      </div>
      <div className="wedding-overlay__venue-block">
        <BilingualBlock
          className="wedding-overlay__venue-bilingual"
          text={overlay.venueName}
        />
      </div>
      <a
        className="wedding-overlay__maps-link"
        href={overlay.mapsUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="wedding-overlay__maps-link-en" lang="en">
          {overlay.mapsLinkLabel.en}
        </span>
        <span className="wedding-overlay__maps-link-ar" dir="rtl" lang="ar">
          {overlay.mapsLinkLabel.ar}
        </span>
      </a>
    </div>
  );
}
