import { createSignal, onMount, For, Show, createMemo } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import DownloadIcon from "lucide-solid/icons/download";
import ImageIcon from "lucide-solid/icons/image";
import SearchIcon from "lucide-solid/icons/search";

// Backgrounds
import bgIPCA from "../assets/img-ipca/bgMain.webp";
import bgIPA from "../assets/img-ipa/bgMain.webp";

export default function GalleryPage() {
  const [items, setItems] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isIPA, setIsIPA] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [selectedImage, setSelectedImage] = createSignal(null);

  const BASE_URL = "https://cloud.isuzuawards.com";

  onMount(async () => {
    // 1. Deteksi Tema
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("type") === "ipa" ||
      window.location.pathname.includes("-ipa")
    ) {
      setIsIPA(true);
    }

    // 2. Fetch Data Gallery
    try {
      const res = await fetch(`${BASE_URL}/api/all-paths-urls-images`);
      const resData = await res.json();
      const rawItems = resData.data || [];

      const formatted = rawItems
        .map((item, index) => ({
          id: index,
          url: item.local_urls?.result_photo || "",
          // Kita asumsikan ada timestamp atau ID unik buat search sederhana
          label: `ISZ-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        }))
        .reverse(); // Yang terbaru di atas

      setItems(formatted);
    } catch (err) {
      console.error("Gallery Error:", err);
    } finally {
      setIsLoading(false);
    }
  });

  // Filter Search
  const filteredItems = createMemo(() => {
    return items().filter((item) =>
      item.label.toLowerCase().includes(searchTerm().toLowerCase()),
    );
  });

  const activeBg = () => (isIPA() ? bgIPA : bgIPCA);
  const themeColor = () => (isIPA() ? "text-blue-500" : "text-purple-500");
  const themeBorder = () => (isIPA() ? "border-blue-500" : "border-purple-500");
  const themeGlow = () =>
    isIPA()
      ? "shadow-[0_0_30px_rgba(37,99,235,0.2)]"
      : "shadow-[0_0_30px_rgba(168,85,247,0.2)]";
  const themeBtn = () => (isIPA() ? "bg-blue-600" : "bg-purple-600");

  return (
    <div
      class="w-full min-h-screen text-white italic font-sans flex flex-col items-center bg-cover bg-center relative overflow-x-hidden"
      style={{
        "background-image": `url(${activeBg()})`,
        "font-family": "FontIsuzuBold",
      }}
    >
      <div class="absolute inset-0 bg-black/70 backdrop-blur-md z-0"></div>

      {/* Header Sticky */}
      <div class="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-lg border-b border-white/10 p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ImageIcon size={20} class={themeColor()} />
            <h1 class="text-2xl font-black uppercase tracking-tighter">
              PHOTO <span class={themeColor()}>ARCHIVE</span>
            </h1>
          </div>
          <span class="text-[10px] bg-white/10 px-3 py-1 rounded-full font-black opacity-60">
            {items().length} ITEMS
          </span>
        </div>

        {/* Search Bar */}
        <div class="relative w-full">
          <SearchIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            size={16}
          />
          <input
            type="text"
            placeholder="SEARCH PHOTO ID..."
            onInput={(e) => setSearchTerm(e.target.value)}
            class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div class="relative z-10 w-full p-6 flex-1">
        <Show when={isLoading()}>
          <div class="w-full h-64 flex flex-col items-center justify-center gap-4 opacity-50">
            <div
              class={`w-10 h-10 border-4 ${themeBorder()} border-t-transparent rounded-full animate-spin`}
            ></div>
            <p class="text-[10px] font-black tracking-[0.3em]">
              SYNCHRONIZING...
            </p>
          </div>
        </Show>

        <div class="grid grid-cols-2 gap-4">
          <For each={filteredItems()}>
            {(item) => (
              <div
                onClick={() => setSelectedImage(item.url)}
                class={`group relative aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 ${themeGlow()} active:scale-95 transition-all`}
              >
                <img
                  src={item.url}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p class="text-[8px] font-black tracking-widest opacity-70">
                    {item.label}
                  </p>
                </div>
              </div>
            )}
          </For>
        </div>

        <Show when={!isLoading() && filteredItems().length === 0}>
          <div class="text-center py-20 opacity-30">
            <p class="text-xs font-black uppercase tracking-[0.2em]">
              No Records Found
            </p>
          </div>
        </Show>
      </div>

      {/* Footer */}
      <div class="relative z-10 p-10 opacity-20 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.4em]">
          ISUZU AWARD GALLERY
        </p>
      </div>

      {/* --- LIGHTBOX / PREVIEW MODAL --- */}
      <Show when={selectedImage()}>
        <div
          class="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div
            class="relative w-full max-w-md flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              class={`w-full aspect-[3/4] rounded-[40px] overflow-hidden border-2 border-white/20 shadow-2xl`}
            >
              <img
                src={selectedImage()}
                class="w-full h-full object-contain bg-black"
              />
            </div>

            <div class="flex gap-4">
              <button
                onClick={() => setSelectedImage(null)}
                class="flex-1 py-5 bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10"
              >
                CLOSE
              </button>
              <a
                href={selectedImage()}
                download="isuzu-moment.png"
                target="_blank"
                class={`flex-[2] py-5 ${themeBtn()} rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-lg`}
              >
                <DownloadIcon size={18} />
                DOWNLOAD
              </a>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
