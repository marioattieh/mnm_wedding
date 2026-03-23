import weddingCopyJson from "./copy.json";

export interface Bilingual {
  en: string;
  ar: string;
}

export interface WeddingCopy {
  invite: {
    headlineLineOne: string;
    cta: string;
  };
  weddingDate: string;
  overlay: {
    title: string;
    subtitle: string;
    groomName: string;
    brideName: string;
    ampersand: string;
    wedding: string;
    ceremonyTime: string;
    venueName: Bilingual;
    mapsUrl: string;
    mapsLinkLabel: string;
  };
  youtubeAudio: {
    play: Bilingual;
    pause: Bilingual;
    iframeTitle: Bilingual;
  };
}

export const weddingCopy = weddingCopyJson as WeddingCopy;
