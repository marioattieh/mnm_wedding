import weddingCopyJson from "./copy.json";

export interface Bilingual {
  en: string;
  ar: string;
}

export interface WeddingCopy {
  invite: {
    headlineLineOne: Bilingual;
    headlineLineTwo: Bilingual;
    cta: string;
  };
  weddingDate: Bilingual;
  overlay: {
    ceremonyLabel: Bilingual;
    ceremonyTime: Bilingual;
    venueName: Bilingual;
    mapsUrl: string;
    mapsLinkLabel: Bilingual;
  };
  youtubeAudio: {
    play: Bilingual;
    pause: Bilingual;
    iframeTitle: Bilingual;
  };
}

export const weddingCopy = weddingCopyJson as WeddingCopy;
