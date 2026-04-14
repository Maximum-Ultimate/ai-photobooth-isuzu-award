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

  // Stats & Gallery States
  const [stats, setStats] = createSignal({ photo_count: 0, print_count: 0 });
  const [galleryItems, setGalleryItems] = createSignal([]);

  // 1. Fungsi Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/statistics`);
      const data = await res.json();
      if (data.status === 200 && data.statistics) {
        setStats({
          photo_count: data.statistics.photo_count || 0,
          print_count: data.statistics.print_count || 0,
        });
      }
    } catch (err) {
      console.error("Stats Error:", err);
    }
  };

  // 2. Fungsi Fetch Gallery (Pake endpoint baru lo)
  const fetchGallery = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/all-paths-urls-images`);
      const data = await res.json();

      // DEBUG: Liat di console bentuk data lo gimana
      console.log("Gallery Data Raw:", data);

      // Asumsi backend balikin array of strings/objects
      // Kita map supaya URL-nya lengkap pake BASE_URL
      const formattedData = data.map((item, index) => {
        // Jika item cuma string path: "uploads/hasil.jpg"
        // Jika item object: { path: "...", download_url: "..." }
        const path = typeof item === "string" ? item : item.path;
        const qrLink =
          typeof item === "string"
            ? `${BASE_URL}/download/${index}`
            : item.download_url;

        return {
          id: index,
          url: path.startsWith("http") ? path : `${BASE_URL}/${path}`,
          qr: qrLink,
        };
      });

      setGalleryItems(formattedData);
    } catch (err) {
      console.error("Gallery Error:", err);
    }
  };

  createEffect(() => {
    if (showStats()) fetchStats();
    if (showGallery()) fetchGallery();
  });

  const handlePrint = (imageUrl) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; background:#000;">
          <img src="${imageUrl}" style="max-height:100%; max-width:100%; object-fit:contain;" onload="window.print(); window.close();">
        </body>
      </html>
    `);
  };

  return (
    <div class="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden text-white italic">
      {/* ... (Background Decor Tetap Sama) ... */}

      {/* Main Content */}
      <div
        class={`relative z-10 flex flex-col h-screen justify-center items-center py-32 px-10 gap-32 ${styles.fadeIn}`}
      >
        {/* ... (Header & Start Button Tetap Sama) ... */}

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

      {/* 📊 POPUP STATISTIC (Tetap Sama) */}

      {/* 🖼️ POPUP GALLERY (FIXED LAYOUT) */}
      <Show when={showGallery()}>
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 p-10">
          <div class="bg-gray-900 border border-white/10 rounded-[40px] w-full max-w-7xl h-full flex flex-col shadow-2xl overflow-hidden relative">
            {/* Header Modal */}
            <div class="p-10 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 class="text-3xl font-black uppercase tracking-tighter italic">
                  Photo Archive
                </h2>
                <p class="text-[10px] text-blue-500 font-bold tracking-widest uppercase mt-1">
                  Total: {galleryItems().length} Captures
                </p>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                class="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500 rounded-full transition-all text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Grid Container */}
            <div class="flex-1 overflow-y-auto p-10">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <For each={galleryItems()}>
                  {(item) => (
                    <div class="group relative bg-black/40 rounded-[32px] overflow-hidden border border-white/5 hover:border-blue-500 transition-all aspect-[3/4]">
                      {/* Image dengan Fallback */}
                      <img
                        src={item.url}
                        alt="Gallery"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x400?text=Load+Error";
                        }}
                      />

                      {/* Hover Overlay */}
                      <div class="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-8 gap-6 backdrop-blur-sm">
                        <div class="bg-white p-2 rounded-xl">
                          <QRComponent urlQr={item.qr} />
                        </div>
                        <button
                          onClick={() => handlePrint(item.url)}
                          class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg"
                        >
                          Print Hardcopy
                        </button>
                        <p class="text-[8px] text-white/40 uppercase tracking-widest font-black">
                          ID: #{item.id}
                        </p>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              {/* Empty State */}
              <Show when={galleryItems().length === 0}>
                <div class="h-full flex flex-col items-center justify-center opacity-20 italic">
                  <p class="text-2xl font-black uppercase">No Data Found</p>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
