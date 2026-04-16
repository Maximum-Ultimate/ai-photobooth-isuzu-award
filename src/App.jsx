// import { createSignal, onCleanup, onMount } from "solid-js";
// import { Router, Route } from "@solidjs/router";
// import Loading from "./layouts/Loading";
// import NotFoundPage from "./layouts/NotFoundPage";
// import bgmPhotobooth from "./assets/sfx/bgm.mp3";

// // IPCA COMPONENTS
// import HomeIPCA from "./layouts/components-ipca/Home";
// import TakePhotoAIIPCA from "./layouts/components-ipca/TakePhotoAI";
// import ChooseGenderModelIPCA from "./layouts/components-ipca/ChooseGenderModel";

// // IPCA COMPONENTS
// import HomeIPA from "./layouts/components-ipa/Home";
// import ChooseGenderModelIPA from "./layouts/components-ipa/ChooseGenderModel";
// import TakePhotoAIIPA from "./layouts/components-ipa/TakePhotoAI";

// let bgmAudio;

// function App() {
//   const [loading, setLoading] = createSignal(true);
//   const [hasPlayed, setHasPlayed] = createSignal(false);

//   const handleUserInteraction = () => {
//     if (!hasPlayed()) {
//       bgmAudio = new Audio(bgmPhotobooth);
//       bgmAudio.loop = true;
//       bgmAudio.volume = 0.5;

//       bgmAudio
//         .play()
//         .then(() => {
//           console.log("BGM started after user interaction");
//           setHasPlayed(true);
//         })
//         .catch((err) => {
//           console.warn("Play failed after interaction:", err);
//         });

//       document.removeEventListener("click", handleUserInteraction);
//     }
//   };

//   // Pasang event listener 1x aja
//   document.addEventListener("click", handleUserInteraction);

//   // Cleanup biar gak double listener kalau komponen re-mount
//   onCleanup(() => {
//     document.removeEventListener("click", handleUserInteraction);
//   });

//   setTimeout(() => {
//     setLoading(false);
//   }, 1500);

//   return (
//     <div
//       class="flex flex-col items-center min-h-screen bg-cover bg-center"
//       // style={{
//       //   "background-image": `url(${backgroundPhotobooth})`,
//       //   "background-size": "cover",
//       //   "background-position": "center",
//       // }}
//       // style={{
//       //   "background-image": `url(${backgroundPhotobooth})`,
//       //   "background-size": "cover",
//       //   "background-position": "center",
//       // }}
//     >
//       {/* <video
//         src={backgroundPhotoboothVideo}
//         autoplay
//         muted
//         playsinline
//         loop
//         class="absolute inset-0 w-full h-full object-cover z-0"
//       /> */}
//       {loading() ? (
//         <Loading />
//       ) : (
//         <Router>
//           {/* IPCA ROUTES */}
//           <Route path="/" component={HomeIPCA} />
//           <Route path="/take-photo-ai" component={TakePhotoAIIPCA} />
//           <Route
//             path="/choose-gender-model"
//             component={ChooseGenderModelIPCA}
//           />

//           {/* IPA ROUTES */}
//           <Route path="/ipa" component={HomeIPA} />
//           <Route path="/take-photo-ai-ipa" component={TakePhotoAIIPA} />
//           <Route
//             path="/choose-gender-model-ipa"
//             component={ChooseGenderModelIPA}
//           />

//           <Route path="/loading" component={Loading} />
//           <Route path="/*" component={NotFoundPage} />
//         </Router>
//       )}
//     </div>
//   );
// }

// export default App;

import { createSignal, onCleanup, Show } from "solid-js";
import { Router, Route } from "@solidjs/router";
import Loading from "./layouts/Loading";
import NotFoundPage from "./layouts/NotFoundPage";
import LayoutWrapper from "./layouts/LayoutWrapper"; // Import wrapper yang tadi dibuat

import bgmPhotobooth from "./assets/sfx/bgm.mp3";

// IPCA COMPONENTS
import HomeIPCA from "./layouts/components-ipca/Home";
import TakePhotoAIIPCA from "./layouts/components-ipca/TakePhotoAI";
import ChooseGenderModelIPCA from "./layouts/components-ipca/ChooseGenderModel";

// IPCA COMPONENTS
import HomeIPA from "./layouts/components-ipa/Home";
import ChooseGenderModelIPA from "./layouts/components-ipa/ChooseGenderModel";
import TakePhotoAIIPA from "./layouts/components-ipa/TakePhotoAI";
import DownloadPage from "./layouts/DownloadPage";
import GalleryPage from "./layouts/GalleryPage";

let bgmAudio;

function App() {
  const [loading, setLoading] = createSignal(true);
  const [hasPlayed, setHasPlayed] = createSignal(false);

  const currentPath = window.location.pathname;
  const isIPA = currentPath.includes("-ipa") || currentPath === "/ipa";

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
    <Show when={!loading()} fallback={<Loading isIPA={isIPA} />}>
      {/* 1. Taruh LayoutWrapper di properti root pada Router */}
      <Router root={LayoutWrapper}>
        {/* IPCA ROUTES */}
        <Route path="/" component={HomeIPCA} />
        <Route path="/choose-gender-model" component={ChooseGenderModelIPCA} />
        <Route path="/take-photo-ai" component={TakePhotoAIIPCA} />

        {/* IPA ROUTES */}
        <Route path="/ipa" component={HomeIPA} />
        <Route
          path="/choose-gender-model-ipa"
          component={ChooseGenderModelIPA}
        />
        <Route path="/take-photo-ai-ipa" component={TakePhotoAIIPA} />

        <Route path="/gallery" component={GalleryPage} />
        <Route path="/download" component={DownloadPage} />

        <Route path="/*" component={NotFoundPage} />
      </Router>
    </Show>
  );
}

export default App;
