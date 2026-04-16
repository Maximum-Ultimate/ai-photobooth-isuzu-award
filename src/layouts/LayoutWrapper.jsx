import { useLocation } from "@solidjs/router";
import { createMemo } from "solid-js";

// Import semua background lo di sini
import bgHomeIPA from "../assets/img-ipa/bgHome.webp";
import bgMainIPA from "../assets/img-ipa/bgMain.webp";
import bgHomeIPCA from "../assets/img-ipca/bgHome.webp";
import bgMainIPCA from "../assets/img-ipca/bgMain.webp";

export default function LayoutWrapper(props) {
  const location = useLocation();

  // Mapping antara path dan background
  const currentBg = createMemo(() => {
    const path = location.pathname;

    const bgMap = {
      "/": bgHomeIPCA,
      "/choose-gender-model": bgMainIPCA,
      "/take-photo-ai": bgMainIPCA,
      "/ipa": bgHomeIPA,
      "/choose-gender-model-ipa": bgMainIPA,
      "/take-photo-ai-ipa": bgMainIPA,
    };

    // Ambil sesuai path, kalau nggak ada (404) balik ke default
    return bgMap[path];
  });

  return (
    <div
      class="flex flex-col items-center min-h-screen transition-all duration-500 ease-in-out bg-cover bg-center"
      style={{
        "background-image": `url(${currentBg()})`,
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      {/* Semua konten halaman lo bakal muncul di props.children */}
      {props.children}
    </div>
  );
}
