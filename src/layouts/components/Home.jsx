import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import styles from "../../App.module.css";

export default function Home() {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = createSignal(false);

  const handleStart = () => {
    setIsClicked(true);
    // Simulasi delay SFX/Animasi sebelum pindah
    setTimeout(() => {
      navigate("/choose-gender-model");
    }, 600);
  };

  return (
    <div class="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Background Decor (Pengganti Video/Image) */}
      <div class="absolute inset-0 opacity-20">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e3a8a_0%,_transparent_70%)]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(to_right,_#ffffff05_1px,_transparent_1px),_linear-gradient(to_bottom,_#ffffff05_1px,_transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Main Content */}
      <div
        class={`relative z-10 flex flex-col h-screen justify-between items-center py-32 px-10 ${styles.fadeIn}`}
      >
        {/* Header Area */}
        <div class="flex flex-col items-center gap-6 text-center">
          <div class="bg-blue-600/20 border border-blue-500/40 px-6 py-2 rounded-full">
            <span class="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">
              System Ready
            </span>
          </div>
          <h1 class="text-7xl font-black italic tracking-tighter uppercase leading-none">
            AI PHOTO<span class="text-blue-500">BOOTH</span>
          </h1>
          <p class="text-gray-500 max-w-md text-sm font-medium tracking-widest uppercase">
            Evolutionary Armor Integration System
          </p>
        </div>

        {/* Action Area */}
        <div class="flex flex-col items-center gap-6">
          <button
            onClick={handleStart}
            disabled={isClicked()}
            class={`
              group relative px-20 py-8 overflow-hidden transition-all duration-300
              border-2 border-white rounded-[20px]
              ${isClicked() ? "scale-95 opacity-50" : "hover:scale-105 active:scale-95"}
            `}
          >
            {/* Background Fill Hover */}
            <div class="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

            <span
              class={`
              relative z-10 text-3xl font-black uppercase italic tracking-widest
              transition-colors duration-300
              ${isClicked() ? "text-gray-400" : "text-white group-hover:text-black"}
            `}
            >
              START JOURNEY
            </span>
          </button>

          <div class="flex items-center gap-4 opacity-30">
            <div class="w-12 h-[1px] bg-white"></div>
            <span class="text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
              Touch to Initialize
            </span>
            <div class="w-12 h-[1px] bg-white"></div>
          </div>
        </div>

        {/* Footer / Build Version */}
        <div class="flex gap-10 opacity-20">
          <div class="flex flex-col items-center text-[8px] font-black tracking-tighter uppercase text-white">
            <span>Terminal</span>
            <span>v.2026.04</span>
          </div>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"></div>
    </div>
  );
}
