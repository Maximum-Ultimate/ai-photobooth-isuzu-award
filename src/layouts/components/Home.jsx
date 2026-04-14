import { createSignal, Show, For, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import styles from "../../App.module.css";
import QRComponent from "../helper/QRComponent";

export default function Home() {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = createSignal(false);
  const BASE_URL = "http://localhost:8000";

  // Modal States
  const [showStats, setShowStats] = createSignal(false);
  const [showGallery, setShowGallery] = createSignal(false);

  // Dynamic Stats State
  const [stats, setStats] = createSignal({ photo_count: 0, print_count: 0 });

  // Fungsi narik data statistik
  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/statistics`);
      const data = await res.json();

      // Ambil objek statistics dari dalam response JSON lo
      if (data.status === 200 && data.statistics) {
        setStats({
          photo_count: data.statistics.photo_count || 0,
          print_count: data.statistics.print_count || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  };

  // Trigger fetch setiap kali modal stats dibuka
  createEffect(() => {
    if (showStats()) {
      fetchStats();
    }
  });

  const [galleryItems] = createSignal([
    {
      id: 1,
      url: "https://via.placeholder.com/300x400",
      qr: "https://google.com",
    },
    {
      id: 2,
      url: "https://via.placeholder.com/300x400",
      qr: "https://google.com",
    },
  ]);

  const handleStart = () => {
    setIsClicked(true);
    setTimeout(() => navigate("/choose-gender-model"), 600);
  };

  const handlePrint = (imageUrl) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <body style="margin:0; display:flex; justify-content:center; align-items:center;">
          <img src="${imageUrl}" style="max-height:100%; max-width:100%; object-fit:contain;" onload="window.print(); window.close();">
        </body>
      </html>
    `);
  };

  return (
    <div class="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden text-white italic">
      {/* Background Decor */}
      <div class="absolute inset-0 opacity-20">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e3a8a_0%,_transparent_70%)]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(to_right,_#ffffff05_1px,_transparent_1px),_linear-gradient(to_bottom,_#ffffff05_1px,_transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Main Content */}
      <div
        class={`relative z-10 flex flex-col h-screen justify-center items-center py-32 px-10 gap-32 ${styles.fadeIn}`}
      >
        <div class="flex flex-col items-center gap-6 text-center">
          <div class="bg-blue-600/20 border border-blue-500/40 px-6 py-2 rounded-full">
            <span class="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">
              System Ready
            </span>
          </div>
          <h1 class="text-7xl font-black uppercase leading-none italic">
            AI PHOTO<span class="text-blue-500">BOOTH</span>
          </h1>
        </div>

        <button
          onClick={handleStart}
          disabled={isClicked()}
          class="group relative px-20 py-8 overflow-hidden transition-all duration-300 border-2 border-white rounded-[20px]"
        >
          <div class="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span
            class={`relative z-10 text-3xl font-black uppercase tracking-widest ${isClicked() ? "text-gray-400" : "text-white group-hover:text-black"}`}
          >
            START JOURNEY
          </span>
        </button>

        <div class="flex gap-6 z-20">
          <button
            onClick={() => setShowStats(true)}
            class="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
          >
            Statistic
          </button>
          <div class="w-[1px] h-4 bg-white/20"></div>
          <button
            onClick={() => setShowGallery(true)}
            class="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
          >
            Gallery
          </button>
        </div>
      </div>

      {/* 📊 POPUP STATISTIC */}
      <Show when={showStats()}>
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div class="bg-gray-900 border border-white/10 p-12 rounded-[40px] w-full max-w-xl relative shadow-2xl">
            <button
              onClick={() => setShowStats(false)}
              class="absolute top-8 right-8 text-gray-500 hover:text-white text-xl font-bold"
            >
              ✕
            </button>
            <h2 class="text-2xl font-black uppercase tracking-tighter mb-10 border-b border-white/10 pb-4 italic">
              System Statistics
            </h2>
            <div class="grid grid-cols-2 gap-8">
              <div class="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                  Total Photos Captured
                </p>
                <p class="text-6xl font-black leading-none">
                  {stats().photo_count}{" "}
                  {/* <-- Sudah sesuai key JSON backend */}
                </p>
              </div>
              <div class="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p class="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">
                  Total Hardcopy Printed
                </p>
                <p class="text-6xl font-black leading-none">
                  {stats().print_count}{" "}
                  {/* <-- Sudah sesuai key JSON backend */}
                </p>
              </div>
            </div>

            <button
              onClick={fetchStats}
              class="mt-8 text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
            >
              ↻ Refresh Data
            </button>
          </div>
        </div>
      </Show>

      {/* 🖼️ POPUP GALLERY */}
      <Show when={showGallery()}>
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div class="bg-gray-900 border border-white/10 p-12 rounded-[40px] w-[90%] h-[80%] relative flex flex-col shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowGallery(false)}
              class="absolute top-8 right-8 text-gray-500 hover:text-white z-10 text-xl font-bold"
            >
              ✕
            </button>
            <h2 class="text-2xl font-black uppercase tracking-tighter mb-8 italic">
              Photo Archive
            </h2>
            <div class="flex-1 overflow-y-auto pr-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <For each={galleryItems()}>
                {(item) => (
                  <div class="group relative bg-white/5 rounded-3xl p-4 border border-white/5 hover:border-blue-500 transition-all">
                    <img
                      src={item.url}
                      class="w-full h-auto rounded-2xl mb-4"
                    />
                    <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center p-6 gap-4 text-center">
                      <div class="scale-50">
                        <QRComponent urlQr={item.qr} />
                      </div>
                      <button
                        onClick={() => handlePrint(item.url)}
                        class="w-full py-2 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl"
                      >
                        Print Now
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>

      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"></div>
    </div>
  );
}
