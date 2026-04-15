import { createSignal, onMount } from "solid-js";

export default function Loading() {
  const [percent, setPercent] = createSignal(0);

  onMount(() => {
    // Simulasi progress bar biar kerasa ada proses loading beneran
    const interval = setInterval(() => {
      setPercent((p) => (p < 90 ? p + 10 : p));
    }, 100);
    return () => clearInterval(interval);
  });

  return (
    <div
      class="min-h-screen w-full flex flex-col items-center justify-center text-white"
      style={{ "font-family": "FontIsuzuBold" }}
    >
      <div class="flex flex-col items-center gap-8 w-full max-w-lg">
        {/* Spinner/Icon Placeholder */}
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 border-2 border-white/5 rounded-full"></div>
          <div class="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>

        {/* Text & Progress */}
        <div class="flex flex-col items-center gap-2 w-full">
          <h2 class="text-xl font-black uppercase tracking-[0.5em] animate-pulse">
            Mempersiapkan Sistem
          </h2>

          {/* Progress Bar */}
          <div class="w-full h-[2px] bg-white/10 mt-4 overflow-hidden rounded-full">
            <div
              class="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${percent()}%` }}
            ></div>
          </div>

          <span class="text-[10px] font-bold text-gray-500 not mt-2">
            {percent()}% SELESAI
          </span>
        </div>
      </div>

      {/* Background Glow */}
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none"></div>
    </div>
  );
}
