import { createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

// Background & Assets
import backgroundMain from "../../assets/img/bgMain.webp";
import maleGender from "../../assets/img/maleGender.webp";
import maleGenderCliicked from "../../assets/img/maleGenderClicked.webp";
import femaleGender from "../../assets/img/femaleGender.webp";
import femaleGenderClicked from "../../assets/img/femaleGenderClicked.webp";
import maleModelImg from "../../assets/models/male1.png";
import femaleModelImg from "../../assets/models/female1.png";
import backgroundButton from "../../assets/img/buttonIdle.webp";

export default function ChooseGenderModel() {
  const navigate = useNavigate();

  // States
  const [selectedGender, setSelectedGender] = createSignal(null); // null, 1 (Male), 2 (Female)
  const [currentIndex, setCurrentIndex] = createSignal(0);

  // States untuk visual feedback button klik
  const [isMaleActive, setIsMaleActive] = createSignal(false);
  const [isFemaleActive, setIsFemaleActive] = createSignal(false);

  // Drag/Swipe Logic States
  const [dragStartX, setDragStartX] = createSignal(null);
  const [dragOffset, setDragOffset] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);
  const [isBackClicked, setIsBackClicked] = createSignal(false);
  const [isModelSelecting, setIsModelSelecting] = createSignal(null);

  // Data Model (Nanti lo mapping src gambarnya di sini)
  const models = {
    // Kalau cuma ada 1 armor, jangan pake Array.from(length: 5)
    1: [
      { id: 1, label: "MALE ARMOR 01", img: maleModelImg },
      // { id: 2, label: "MALE ARMOR 02", img: maleModelImg }, // Tambahin manual di sini kalau nambah
    ],
    2: [{ id: 1, label: "FEMALE ARMOR 01", img: femaleModelImg }],
  };

  const getActiveModels = () => models[selectedGender()] || [];

  // Handlers
  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setCurrentIndex(0);
  };

  // 1. Update Logic Handlers (Biar nggak looping/infinity)
  const nextSlide = () => {
    if (currentIndex() < getActiveModels().length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex() > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Pointer Gestures
  const handlePointerDown = (e) => {
    setDragStartX(e.clientX || e.touches?.[0]?.clientX);
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging()) return;
    const currentX = e.clientX || e.touches?.[0]?.clientX;
    setDragOffset(currentX - dragStartX());
  };

  const handlePointerUp = () => {
    if (!isDragging()) return;
    if (dragOffset() > 100) prevSlide();
    else if (dragOffset() < -100) nextSlide();

    setDragOffset(0);
    setIsDragging(false);
  };

  const confirmSelection = (modelId) => {
    setIsModelSelecting(modelId); // Trigger animasi

    // Kasih delay dikit biar user liat animasinya dulu baru pindah page
    setTimeout(() => {
      setIsModelSelecting(null);
      navigate(`/take-photo-ai?gender=${selectedGender()}&modelId=${modelId}`);
    }, 400);
  };

  return (
    <div
      class="min-h-screen w-full text-white flex flex-col items-center justify-center overflow-hidden"
      style={{
        "background-image": `url(${backgroundMain})`,
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      {/* 1. GENDER SELECTION STATE */}
      <Show when={selectedGender() === null}>
        <div class="flex flex-col items-center gap-24 animate-in fade-in zoom-in duration-500">
          <div class="text-center space-y-2">
            <h1
              class="text-6xl font-black uppercase tracking-wide"
              style={{ "font-family": "FontIsuzuBold" }}
            >
              Pilih jenis kelamin
            </h1>
          </div>

          <div class="flex gap-12">
            {/* --- FEMALE OPTION --- */}
            <button
              onClick={() => {
                setIsFemaleActive(true);
                setTimeout(() => {
                  setIsFemaleActive(false);
                  handleGenderSelect(2);
                }, 300);
              }}
              class="relative w-[410px] h-[410px] transition-all duration-300 flex items-center justify-center overflow-hidden hover:scale-110 active:scale-95 group"
              style={{
                "background-image": `url(${isFemaleActive() ? femaleGenderClicked : femaleGender})`,
                "background-size": "contain",
                "background-position": "center",
                "background-repeat": "no-repeat",
              }}
            ></button>
            {/* --- MALE OPTION --- */}
            <button
              onClick={() => {
                setIsMaleActive(true);
                setTimeout(() => {
                  setIsMaleActive(false);
                  handleGenderSelect(1);
                }, 300);
              }}
              class="relative w-[410px] h-[410px] transition-all duration-300 flex items-center justify-center overflow-hidden hover:scale-110 active:scale-95 group"
              style={{
                "background-image": `url(${isMaleActive() ? maleGenderCliicked : maleGender})`,
                "background-size": "contain",
                "background-position": "center",
                "background-repeat": "no-repeat",
              }}
            ></button>
          </div>
        </div>
      </Show>

      {/* 2. ARMOR SLIDER STATE */}
      <Show when={selectedGender() !== null}>
        <div class="relative w-full h-screen flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-10 duration-700">
          <button
            onClick={() => setSelectedGender(null)}
            class="absolute top-10 left-10 z-50 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all border-b border-white not-italic"
          >
            ← Back to Gender
          </button>

          <div class="relative w-full flex items-center justify-center">
            {/* ⬅️ Arrow Left: Muncul hanya jika BUKAN di item pertama DAN total armor > 1 */}
            <Show when={getActiveModels().length > 1 && currentIndex() > 0}>
              <button
                onClick={prevSlide}
                class="absolute left-10 z-[100] w-20 h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-blue-500 transition-all animate-pulse"
              >
                <span class="text-3xl font-bold not-italic">〈</span>
              </button>
            </Show>

            {/* Carousel Wrapper */}
            <div
              class="relative flex items-center justify-center w-full h-[1200px] cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <For each={getActiveModels()}>
                {(model, index) => {
                  const offset = () => index() - currentIndex();
                  const isActive = () => index() === currentIndex();
                  const isThisSelected = () => isModelSelecting() === model.id;

                  return (
                    <div
                      onClick={() => isActive() && confirmSelection(model.id)}
                      class="absolute transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] select-none"
                      style={{
                        transform: `
            translateX(${offset() * 450 + dragOffset()}px) 
            scale(${isThisSelected() ? 0.9 : isActive() ? 1 : 0.5}) 
            rotateY(${offset() * -45}deg)
            translateZ(${isActive() ? "100px" : "0px"})
          `,
                        "z-index": 20 - Math.abs(offset()),
                        opacity:
                          Math.abs(offset()) > 1 ? 0 : isActive() ? 1 : 0.3,
                        "pointer-events": isActive() ? "auto" : "none",
                      }}
                    >
                      <div
                        class={`
            w-[750px] h-[1150px] rounded-[60px] flex flex-col items-center justify-between p-12 transition-all duration-300 overflow-hidden
            ${isActive() ? "bg-white/5 border border-white/20" : "opacity-50 grayscale blur-[2px]"}
            ${isThisSelected() ? "bg-blue-500/30 border-blue-400 shadow-[0_0_120px_rgba(59,130,246,0.8)] scale-95" : "shadow-[0_0_100px_rgba(59,130,246,0.3)]"}
          `}
                      >
                        {/* Flash Effect pas diklik */}
                        <Show when={isThisSelected()}>
                          <div class="absolute inset-0 bg-white/20 animate-ping pointer-events-none"></div>
                        </Show>

                        <div class="flex-1 w-full flex items-center justify-center pointer-events-none">
                          <img
                            src={model.img}
                            alt={model.label}
                            class={`max-w-full max-h-full object-contain transition-transform duration-300 drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${isThisSelected() ? "scale-110" : ""}`}
                          />
                        </div>

                        <div class="w-full text-center mt-6">
                          <h3
                            class={`text-4xl font-black uppercase tracking-tighter block mb-6 transition-colors ${isThisSelected() ? "text-blue-400" : "text-white"}`}
                          >
                            {model.label}
                          </h3>
                          <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              class={`h-full transition-all duration-300 ${isThisSelected() ? "bg-white w-full" : "bg-blue-500 w-full shadow-[0_0_20px_#3b82f6]"}`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>

            {/* ➡️ Arrow Right: Muncul hanya jika BUKAN di item terakhir DAN total armor > 1 */}
            <Show
              when={
                getActiveModels().length > 1 &&
                currentIndex() < getActiveModels().length - 1
              }
            >
              <button
                onClick={nextSlide}
                class="absolute right-10 z-[100] w-20 h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-blue-500 transition-all animate-pulse"
              >
                <span class="text-3xl font-bold not-italic">〉</span>
              </button>
            </Show>
          </div>

          {/* Hint Swipe: Hanya muncul jika ada lebih dari 1 armor */}
          <Show when={getActiveModels().length > 1}>
            <p class="mt-10 text-[10px] font-black uppercase tracking-[0.5em] opacity-20 animate-bounce italic">
              Swipe or Use Arrows to Browse
            </p>
          </Show>
        </div>
      </Show>
      <button
        onClick={() => {
          setIsBackClicked(true);
          setTimeout(() => {
            setIsBackClicked(false);
            setSelectedGender(null);
            navigate("/");
          }, 200);
        }}
        disabled={isBackClicked()}
        class={`
          absolute bottom-48 left-10 z-[150] w-[280px] h-[100px] 
          transition-all duration-200 flex items-center justify-center 
          overflow-hidden hover:scale-105 active:scale-90
          /* Efek Shrink & Dimming pas diklik */
          ${isBackClicked() ? "scale-90 brightness-75" : "scale-100 brightness-100"}
        `}
        style={{
          "font-family": "FontIsuzuBold",
          "background-image": `url(${backgroundButton})`,
          "background-size": "100% 100%",
          "background-position": "center",
          "background-repeat": "no-repeat",
        }}
      >
        <span
          class={`
            relative z-10 text-2xl font-black uppercase tracking-widest pt-1
            transition-all duration-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]
            /* Teks agak turun pas diklik */
            ${isBackClicked() ? "text-gray-300 translate-y-1" : "text-white group-hover:text-blue-400"}
          `}
        >
          〈 Back
        </span>
      </button>
    </div>
  );
}
