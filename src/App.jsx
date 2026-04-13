import { createSignal, onCleanup, onMount } from "solid-js";
import { Router, Route } from "@solidjs/router";
import Home from "./layouts/components/Home";
import Loading from "./layouts/Loading";
import NotFoundPage from "./layouts/NotFoundPage";
import bgmPhotobooth from "./assets/sfx/bgm.mp3";
import TakePhotoAI from "./layouts/components/TakePhotoAI";

import backgroundPhotobooth from "./assets/yamaha-assets/main-background.webp";
import yamahaLogo from "./assets/yamaha-assets/yamaha-logo.webp";
import ChooseGenderModel from "./layouts/components/ChooseGenderModel";

let bgmAudio;

function App() {
  const [loading, setLoading] = createSignal(true);
  const [hasPlayed, setHasPlayed] = createSignal(false);

  const handleUserInteraction = () => {
    if (!hasPlayed()) {
      bgmAudio = new Audio(bgmPhotobooth);
      bgmAudio.loop = true;
      bgmAudio.volume = 0.5;

      bgmAudio
        .play()
        .then(() => {
          console.log("BGM started after user interaction");
          setHasPlayed(true);
        })
        .catch((err) => {
          console.warn("Play failed after interaction:", err);
        });

      document.removeEventListener("click", handleUserInteraction);
    }
  };

  // Pasang event listener 1x aja
  document.addEventListener("click", handleUserInteraction);

  // Cleanup biar gak double listener kalau komponen re-mount
  onCleanup(() => {
    document.removeEventListener("click", handleUserInteraction);
  });

  setTimeout(() => {
    setLoading(false);
  }, 1500);

  return (
    <div
      class="flex flex-col items-center min-h-screen bg-cover bg-center"
      style={{
        "background-image": `url(${backgroundPhotobooth})`,
        "background-size": "cover",
        "background-position": "center",
      }}
      // style={{
      //   "background-image": `url(${backgroundPhotobooth})`,
      //   "background-size": "cover",
      //   "background-position": "center",
      // }}
    >
      {/* <video
        src={backgroundPhotoboothVideo}
        autoplay
        muted
        playsinline
        loop
        class="absolute inset-0 w-full h-full object-cover z-0"
      /> */}
      <img class="absolute top-16 left-16 z-50" src={yamahaLogo} alt="" />
      {loading() ? (
        <Loading />
      ) : (
        <Router>
          <Route path="/" component={Home} />
          <Route path="/take-photo-ai" component={TakePhotoAI} />
          <Route path="/choose-gender-model" component={ChooseGenderModel} />
          <Route path="/loading" component={Loading} />
          <Route path="/*" component={NotFoundPage} />
        </Router>
      )}
    </div>
  );
}

export default App;
