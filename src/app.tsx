import "@/app.css";

import { AppLoadingFallback } from "@components/app-loading-fallback";
import { WeddingInviteScreen } from "@components/wedding-invite-screen";
import WeddingMainExperience from "@components/wedding-main-experience";
import { WeddingYoutubeAudio } from "@components/wedding-youtube-audio";
import { useEffect, useState } from "react";

import { getSlideshowUrlsPromise } from "@/wedding/slideshow-urls-promise";

function App() {
  const [started, setStarted] = useState(false);
  const [slideshowUrls, setSlideshowUrls] = useState<string[] | null>(null);

  useEffect(() => {
    void getSlideshowUrlsPromise().then(setSlideshowUrls);
  }, []);

  const showMusicToggle = started && slideshowUrls !== null;

  return (
    <div className="app">
      <WeddingYoutubeAudio showToggle={showMusicToggle} />
      {!started ? (
        <WeddingInviteScreen onFinished={() => setStarted(true)} />
      ) : slideshowUrls === null ? (
        <AppLoadingFallback />
      ) : (
        <WeddingMainExperience slideshowUrls={slideshowUrls} />
      )}
    </div>
  );
}

export default App;
