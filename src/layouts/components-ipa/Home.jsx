import { createSignal, Show, For, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import styles from "../../App.module.css";
import QRComponent from "../helper/QRComponent";

// Background & Assets
import logoTitle from "../../assets/img-ipca/logoTitle.webp";
import backgroundPhotobooth from "../../assets/img-ipa/bgMain.webp";
import backgroundButton from "../../assets/img-ipa/buttonIdle.webp";

// SFX Asset
import sfxBtnFile from "../../assets/sfx/sfxbtn.wav";

export default function Home() {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = createSignal(false);
  const BASE_URL = "http://localhost:6241";

  // --- 🔊 SFX HELPER ---
  const playSfx = () => {
    const sfx = new Audio(sfxBtnFile);
    sfx.volume = 0.6;
    sfx.play().catch((err) => console.warn("SFX Playback failed:", err));
  };

  // --- STATES ---
  const [showStats, setShowStats] = createSignal(false);
  const [showGallery, setShowGallery] = createSignal(false);
  const [selectedPreview, setSelectedPreview] = createSignal(null);
  const [activeTab, setActiveTab] = createSignal("photo"); // "photo" atau "qr"

  const [stats, setStats] = createSignal({ photo_count: 0, print_count: 0 });
  const [galleryItems, setGalleryItems] = createSignal([]);

  // --- FETCHING LOGIC ---
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

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/all-paths-urls-images`);
      const resData = await res.json();
      const rawItems = resData.data || [];
      const formattedData = rawItems.map((item, index) => ({
        id: index,
        url: item.local_urls?.result_photo || "",
        qr: item.urls?.result_photo || "",
      }));
      setGalleryItems(formattedData);
    } catch (err) {
      console.error("Gallery Error:", err);
    }
  };

  createEffect(() => {
    if (showStats()) fetchStats();
    if (showGallery()) fetchGallery();
  });

  // --- HANDLERS ---
  const handlePrint = (imageUrl) => {
    playSfx();
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
    <div
      class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden text-white italic"
      style={{
        "background-image": `url(${backgroundPhotobooth})`,
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      {/* --- MAIN CONTENT --- */}
      <div
        class={`relative z-10 flex flex-col h-screen justify-center items-center py-32 px-10 gap-32 ${styles.fadeIn}`}
      >
        <div class="flex flex-col items-center gap-6 text-center">
          <img src={logoTitle} alt="Logo" class="max-w-4xl" />
        </div>

        {/* START BUTTON */}
        <button
          onClick={() => {
            playSfx();
            setIsClicked(true);
            setTimeout(() => setIsClicked(false), 300);
            setTimeout(() => navigate("/choose-gender-model-ipa"), 400);
          }}
          disabled={isClicked()}
          class={`
            group relative w-[600px] h-[220px] transition-all duration-200
            flex items-center justify-center overflow-hidden
            hover:scale-105 active:scale-90
            ${isClicked() ? "scale-90 brightness-75 opacity-90" : "scale-100 brightness-100 opacity-100"}
          `}
          style={{
            "font-family": "FontIsuzuBold",
            "background-image": `url(${backgroundButton})`,
            "background-size": "90% 90%",
            "background-position": "center",
            "background-repeat": "no-repeat",
          }}
        >
          <span
            class={`
              relative z-10 text-5xl font-black uppercase tracking-wide pt-1
              transition-all duration-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]
              ${isClicked() ? "text-gray-400 translate-y-2" : "text-white group-hover:text-blue-400"}
            `}
          >
            Buat fotomu sendiri
          </span>
        </button>

        {/* FOOTER BUTTONS */}
        <div class="flex gap-6 z-20">
          <button
            onClick={() => {
              playSfx();
              setShowStats(true);
            }}
            class="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
          >
            Statistic
          </button>
          <div class="w-[1px] h-4 bg-white/20"></div>
          <button
            onClick={() => {
              playSfx();
              setShowGallery(true);
            }}
            class="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
          >
            Gallery
          </button>
        </div>
      </div>

      {/* --- 📊 MODAL STATISTIC --- */}
      <Show when={showStats()}>
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl animate-in fade-in duration-300 p-5">
          <div class="bg-gray-900 border border-white/10 p-12 rounded-[40px] w-full max-w-xl relative shadow-2xl text-center">
            <button
              onClick={() => {
                playSfx();
                setShowStats(false);
              }}
              class="absolute top-8 right-8 text-gray-500 hover:text-white text-xl"
            >
              ✕
            </button>
            <h2 class="text-2xl font-black uppercase tracking-tighter mb-10 border-b border-white/10 pb-4">
              System Statistics
            </h2>
            <div class="">
              <div class="p-6 bg-white/5 rounded-3xl border border-white/5 shadow-inner text-center">
                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                  Captured
                </p>
                <p class="text-6xl font-black">{stats().photo_count}</p>
              </div>
              {/* <div class="p-6 bg-white/5 rounded-3xl border border-white/5 shadow-inner text-center">
                <p class="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">
                  Printed
                </p>
                <p class="text-6xl font-black">{stats().print_count}</p>
              </div> */}
            </div>
            <button
              onClick={() => {
                playSfx();
                fetchStats();
              }}
              class="mt-8 text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
            >
              ↻ REFRESH DATA
            </button>
          </div>
        </div>
      </Show>

      {/* --- 🖼️ MODAL GALLERY --- */}
      <Show when={showGallery()}>
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 p-10">
          <div class="bg-gray-900 border border-white/10 rounded-[40px] w-full max-w-7xl h-full flex flex-col shadow-2xl overflow-hidden relative">
            <div class="p-10 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
              <div>
                <h2 class="text-3xl font-black uppercase tracking-tighter">
                  Photo Archive
                </h2>
                <p class="text-[10px] text-blue-500 font-bold tracking-widest uppercase mt-1">
                  Total Records: {galleryItems().length}
                </p>
              </div>
              <button
                onClick={() => {
                  playSfx();
                  setShowGallery(false);
                }}
                class="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500 rounded-full transition-all text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-10 bg-black/20">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <For each={galleryItems()}>
                  {(item) => (
                    <div
                      onClick={() => {
                        playSfx();
                        setSelectedPreview(item);
                        setActiveTab("photo");
                      }}
                      class="group relative bg-black/40 rounded-[32px] overflow-hidden border border-white/5 hover:border-blue-500 transition-all duration-300 aspect-[3/4] shadow-lg cursor-pointer"
                    >
                      <img
                        src={item.url}
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <span class="text-[10px] font-black uppercase tracking-widest border border-white px-6 py-2 rounded-full">
                          Open Options
                        </span>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* --- 🔎 MODAL PREVIEW --- */}
      <Show when={selectedPreview()}>
        <div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in zoom-in duration-300 p-5 md:p-10">
          <div class="relative w-full max-w-5xl bg-gray-900 border border-white/10 rounded-[50px] overflow-hidden flex flex-col shadow-2xl h-[90vh]">
            <button
              onClick={() => {
                playSfx();
                setSelectedPreview(null);
              }}
              class="absolute top-6 right-8 z-50 text-gray-500 hover:text-white text-3xl font-bold transition-colors"
            >
              ✕
            </button>

            {/* TAB NAV */}
            <div class="flex border-b border-white/5 bg-black/40">
              <button
                onClick={() => {
                  playSfx();
                  setActiveTab("photo");
                }}
                class={`flex-1 py-8 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 ${activeTab() === "photo" ? "text-blue-500 bg-blue-500/5 border-b-2 border-blue-500" : "text-gray-500"}`}
              >
                01. Preview Photo
              </button>
              <button
                onClick={() => {
                  playSfx();
                  setActiveTab("qr");
                }}
                class={`flex-1 py-8 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 ${activeTab() === "qr" ? "text-blue-500 bg-blue-500/5 border-b-2 border-blue-500" : "text-gray-500"}`}
              >
                02. Get QR Code
              </button>
            </div>

            {/* CONTENT */}
            <div class="flex-1 relative overflow-hidden flex items-center justify-center p-10">
              <Show when={activeTab() === "photo"}>
                <div class="w-full h-full flex flex-col items-center justify-center gap-8 animate-in fade-in slide-in-from-left-5">
                  <div class="flex-1 w-full bg-black/50 rounded-3xl overflow-hidden border border-white/5">
                    <img
                      src={selectedPreview().url}
                      class="w-full h-full object-contain"
                    />
                  </div>
                  {/* <button
                    onClick={() => handlePrint(selectedPreview().url)}
                    class="px-20 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all"
                  >
                    Print This Photo
                  </button> */}
                </div>
              </Show>

              <Show when={activeTab() === "qr"}>
                <div class="w-full h-full flex flex-col items-center justify-center gap-12 animate-in fade-in slide-in-from-right-5">
                  <div class="bg-white p-10 rounded-[50px] shadow-[0_0_60px_rgba(255,255,255,0.15)] transform scale-125">
                    <img
                      src={selectedPreview().qr}
                      class="w-[450px] h-[450px] md:w-[550px] md:h-[550px] object-contain"
                    />
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-black uppercase tracking-tighter text-blue-500 mb-2">
                      Scan to Download
                    </p>
                    <p class="text-[11px] text-gray-400 uppercase tracking-widest leading-relaxed">
                      Scan with mobile camera to save your armor integration.
                    </p>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
