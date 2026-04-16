import { createSignal, onMount } from "solid-js";
// Import kedua background-nya
import bgMainIPA from "../assets/img-ipa/bgMain.webp";
import bgMainIPCA from "../assets/img-ipca/bgMain.webp";

export default function Loading(props) {
  const [percent, setPercent] = createSignal(0);

  // Tentukan background berdasarkan props
  const activeBg = () => (props.isIPA ? bgMainIPA : bgMainIPCA);

  onMount(() => {
    const interval = setInterval(() => {
      setPercent((p) => (p < 90 ? p + 10 : p));
    }, 100);
    return () => clearInterval(interval);
  });

  return (
    <div
      class="min-h-screen w-full flex flex-col items-center justify-center text-white bg-cover bg-center relative"
      style={{
        "font-family": "FontIsuzuBold",
        "background-image": `url(${activeBg()})`,
      }}
    >
      {/* Overlay Gelap + Blur */}
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div class="relative z-10 flex flex-col items-center gap-8 w-full max-w-lg">
        {/* Spinner */}
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 border-2 border-white/5 rounded-full"></div>
          <div class="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>

        <div class="flex flex-col items-center gap-2 w-full text-center">
          <h2 class="text-xl font-black uppercase tracking-[0.5em] animate-pulse">
            Mempersiapkan Sistem
          </h2>

          <div class="w-full h-[2px] bg-white/10 mt-4 overflow-hidden rounded-full">
            <div
              class="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_#3b82f6]"
              style={{ width: `${percent()}%` }}
            ></div>
          </div>

          <span class="text-[10px] font-bold text-gray-400 mt-2 tracking-widest">
            {percent()}% SELESAI
          </span>
        </div>
      </div>
    </div>
  );
}
