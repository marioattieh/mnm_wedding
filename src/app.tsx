import { AppLoadingFallback } from "@components/app-loading-fallback";
import { WeddingInviteScreen } from "@components/wedding-invite-screen";
import WeddingMainExperience from "@components/wedding-main-experience";
import {
  WeddingYoutubeAudio,
  type WeddingYoutubeAudioHandle,
} from "@components/wedding-youtube-audio";
import { useCallback, useEffect, useRef, useState } from "react";

import { getSlideshowUrlsPromise } from "@/wedding/slideshow-urls-promise";

function App() {
  const [started, setStarted] = useState(false);
  const [slideshowUrls, setSlideshowUrls] = useState<string[] | null>(null);
  const audioRef = useRef<WeddingYoutubeAudioHandle | null>(null);

  useEffect(() => {
    void getSlideshowUrlsPromise().then(setSlideshowUrls);
  }, []);

  const showMusicToggle = started && slideshowUrls !== null;
  const handleBegin = useCallback(() => {
    audioRef.current?.playFromUserGesture();
  }, []);

  return (
    <div className="relative min-h-dvh max-h-dvh w-full overflow-x-hidden bg-ink-950">
      <WeddingYoutubeAudio ref={audioRef} showToggle={showMusicToggle} />
      {!started ? (
        <WeddingInviteScreen
          onBegin={handleBegin}
          onFinished={() => setStarted(true)}
        />
      ) : slideshowUrls === null ? (
        <AppLoadingFallback />
      ) : (
        <WeddingMainExperience slideshowUrls={slideshowUrls} />
      )}
    </div>
  );
}

export default App;
