import { createSignal, onMount, Show } from "solid-js";
import DownloadIcon from "lucide-solid/icons/download";
import ZapIcon from "lucide-solid/icons/zap";

// Import Backgrounds
import bgIPCA from "../assets/img-ipca/bgMain.webp";
import bgIPA from "../assets/img-ipa/bgMain.webp";

export default function DownloadPage() {
  const [photoUrl, setPhotoUrl] = createSignal("");
  const [isIPA, setIsIPA] = createSignal(false);

  // Sesuaikan domain backend lo
  const PUBLIC_BACKEND_URL = "https://cloud.isuzuawards.com";

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const photoParam = params.get("photo");

    // DETEKSI TEMA
    const type = params.get("type");
    if (type === "ipa" || window.location.pathname.includes("-ipa")) {
      setIsIPA(true);
    }

    if (photoParam) {
      const fileName = photoParam.split("/").pop();
      const fullUrl = `${PUBLIC_BACKEND_URL}/photos/${fileName}`;
      setPhotoUrl(fullUrl);
    }
  });

  const handleDownload = () => {
    if (!photoUrl()) return;
    const link = document.createElement("a");
    link.href = photoUrl();
    link.target = "_blank";
    link.setAttribute("download", `isuzu-moment.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pilih BG dan Warna berdasar tema
  const activeBg = () => (isIPA() ? bgIPA : bgIPCA);
  const themeColor = () => (isIPA() ? "text-blue-500" : "text-purple-500");
  const themeBorder = () => (isIPA() ? "border-blue-500" : "border-purple-500");
  const themeBtn = () =>
    isIPA()
      ? "bg-blue-600 hover:bg-blue-500 shadow-[0_15px_30px_rgba(37,99,235,0.3)]"
      : "bg-purple-500 hover:bg-purple-400 shadow-[0_15px_30px_rgba(168,85,247,0.3)]";
  const themeGlow = () =>
    isIPA()
      ? "shadow-[0_0_50px_rgba(37,99,235,0.2)]"
      : "shadow-[0_0_50px_rgba(168,85,247,0.2)]";

  return (
    // FIX: Tambahkan h-screen dan overflow-y-auto agar container utama bisa di-scroll
    <div
      class="relative w-full h-screen overflow-y-auto bg-black text-white italic font-sans select-none"
      style={{
        "font-family": "FontIsuzuBold",
      }}
    >
      {/* Background Image - Fixed biar gak ikut kegulung */}
      <div
        class="fixed inset-0 bg-cover bg-center z-0"
        style={{ "background-image": `url(${activeBg()})` }}
      />

      {/* Dark Overlay - Fixed */}
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      {/* Main Content Scrollable Wrapper */}
      <div class="relative z-10 w-full flex flex-col items-center p-6 min-h-full">
        <style>{`
          @keyframes popUp {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-pop { animation: popUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .hint-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        `}</style>

        {/* Header - Tambah shrink-0 biar gak kegencet */}
        <div
          class={`w-full max-w-md flex flex-col items-center gap-1 border-b-2 ${themeBorder()} pb-6 mb-8 pt-8 shrink-0`}
        >
          <div class="flex items-center gap-3">
            <ZapIcon size={24} class={themeColor()} fill="currentColor" />
            <h1 class="text-4xl font-black uppercase tracking-tighter italic leading-none">
              ISUZU
              <span class={`${themeColor()} font-light`}> MOMENT</span>
            </h1>
          </div>
          <p class="text-[8px] tracking-[0.4em] opacity-40 uppercase font-bold mt-2">
            AI Armor Integration Result
          </p>
        </div>

        {/* Photo Preview - Pake w-full max-w-md biar responsif */}
        <div
          class={`w-full max-w-md aspect-[3/4] bg-zinc-900 rounded-[40px] overflow-hidden border-2 border-white/10 ${themeGlow()} mb-8 animate-pop shrink-0`}
        >
          <Show
            when={photoUrl()}
            fallback={
              <div class="w-full h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                <div class="animate-spin duration-1000">
                  <ZapIcon size={48} class={`${themeColor()} opacity-20`} />
                </div>
                <p class="font-bold uppercase text-[10px] tracking-widest text-center opacity-50">
                  Initializing Your Armor...
                </p>
              </div>
            }
          >
            <img
              src={photoUrl()}
              class="w-full h-full object-cover"
              alt="Moment"
            />
          </Show>
        </div>

        {/* Tip */}
        <div class="w-full max-w-md mb-8 bg-white/5 border border-white/10 py-4 px-8 rounded-2xl flex items-center justify-center gap-4 hint-pulse shrink-0">
          <div
            class={`w-2 h-2 ${isIPA() ? "bg-blue-500" : "bg-purple-500"} rounded-full animate-ping`}
          ></div>
          <p class="text-[10px] uppercase font-black tracking-widest text-zinc-300">
            Tip: Long-press image to Save to Gallery
          </p>
        </div>

        {/* Action - Tambahkan padding bottom ekstra (pb-12) agar tombol gak mentok */}
        <div class="w-full max-w-md flex flex-col gap-6 pb-12 shrink-0">
          <button
            onClick={handleDownload}
            disabled={!photoUrl()}
            class={`w-full py-7 rounded-[30px] flex items-center justify-center gap-5 font-black uppercase text-2xl transition-all active:scale-[0.85] text-white disabled:bg-zinc-800 disabled:text-zinc-600 ${themeBtn()}`}
          >
            <DownloadIcon size={32} />
            Get Photo
          </button>

          <div class="flex flex-col items-center gap-2 mt-2 text-zinc-500">
            <p class="text-center text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
              ISUZU AWARD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
