import { createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

// Background & Assets
import backgroundMain from "../../assets/img-ipca/bgMain.webp";
import maleGender from "../../assets/img-ipca/maleGender.webp";
import maleGenderCliicked from "../../assets/img-ipca/maleGenderClicked.webp";
import femaleGender from "../../assets/img-ipca/femaleGender.webp";
import femaleGenderClicked from "../../assets/img-ipca/femaleGenderClicked.webp";
import backgroundButton from "../../assets/img-ipca/buttonIdle.webp";

// Models
import maleModelImg1 from "../../assets/img-ipca/male1.png";
import maleModelImg2 from "../../assets/img-ipca/male2.png";
import maleModelImg3 from "../../assets/img-ipca/male3.png";
import femaleModelImg1 from "../../assets/img-ipca/female1.png";
import femaleModelImg2 from "../../assets/img-ipca/female2.png";
import femaleModelImg3 from "../../assets/img-ipca/female3.png";

// SFX
import sfxBtnFile from "../../assets/sfx/sfxbtn.wav";

export default function ChooseGenderModel() {
  const navigate = useNavigate();

  // --- 🔊 SFX HELPER ---
  const playSfx = () => {
    const sfx = new Audio(sfxBtnFile);
    sfx.volume = 0.6;
    sfx.play().catch((err) => console.warn("SFX Playback failed:", err));
  };

  // States
  const [selectedGender, setSelectedGender] = createSignal(null);
  const [currentIndex, setCurrentIndex] = createSignal(0);

  const [isMaleActive, setIsMaleActive] = createSignal(false);
  const [isFemaleActive, setIsFemaleActive] = createSignal(false);

  const [dragStartX, setDragStartX] = createSignal(null);
  const [dragOffset, setDragOffset] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);
  const [isBackClicked, setIsBackClicked] = createSignal(false);
  const [isModelSelecting, setIsModelSelecting] = createSignal(null);

  const models = {
    1: [
      { id: 4, label: "MALE ARMOR 01", img: maleModelImg1 },
      { id: 5, label: "MALE ARMOR 02", img: maleModelImg2 },
      { id: 6, label: "MALE ARMOR 03", img: maleModelImg3 },
    ],
    2: [
      { id: 4, label: "FEMALE ARMOR 01", img: femaleModelImg1 },
      { id: 5, label: "FEMALE ARMOR 02", img: femaleModelImg2 },
      { id: 6, label: "FEMALE ARMOR 03", img: femaleModelImg3 },
    ],
  };

  const getActiveModels = () => models[selectedGender()] || [];

  const handleGenderSelect = (gender) => {
    playSfx();
    setSelectedGender(gender);
    setCurrentIndex(0);
  };

  const nextSlide = () => {
    if (currentIndex() < getActiveModels().length - 1) {
      playSfx();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex() > 0) {
      playSfx();
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
    playSfx();
    setIsModelSelecting(modelId);
    setTimeout(() => {
      setIsModelSelecting(null);
      navigate(`/take-photo-ai?gender=${selectedGender()}&modelId=${modelId}`);
    }, 400);
  };

  return (
    <div
      class="min-h-screen w-full text-white flex flex-col items-center justify-center overflow-hidden italic"
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
            />
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
            />
          </div>
        </div>
      </Show>

      {/* 2. ARMOR SLIDER STATE */}
      <Show when={selectedGender() !== null}>
        <div class="relative w-full h-screen flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-10 duration-700">
          {/* Tombol Back (Kembali ke Pilih Gender) */}
          <button
            onClick={() => {
              playSfx();
              setIsBackClicked(true);
              setTimeout(() => {
                setIsBackClicked(false);
                setSelectedGender(null);
              }, 200);
            }}
            disabled={isBackClicked()}
            class={`absolute bottom-48 left-10 z-[150] w-[280px] h-[100px] transition-all duration-200 flex items-center justify-center overflow-hidden hover:scale-105 active:scale-90 ${isBackClicked() ? "scale-90 brightness-75" : "scale-100 brightness-100"}`}
            style={{
              "font-family": "FontIsuzuBold",
              "background-image": `url(${backgroundButton})`,
              "background-size": "100% 100%",
              "background-position": "center",
              "background-repeat": "no-repeat",
            }}
          >
            <span
              class={`relative z-10 text-2xl font-black uppercase tracking-widest pt-1 transition-all duration-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${isBackClicked() ? "text-gray-300 translate-y-1" : "text-white group-hover:text-blue-400"}`}
            >
              〈 Back
            </span>
          </button>

          <div class="relative w-full flex items-center justify-center">
            <Show when={getActiveModels().length > 1 && currentIndex() > 0}>
              <button
                onClick={prevSlide}
                class="absolute left-10 z-[100] w-20 h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-blue-500 transition-all animate-pulse"
              >
                <span class="text-3xl font-bold not-italic">〈</span>
              </button>
            </Show>

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
                        transform: `translateX(${offset() * 450 + dragOffset()}px) scale(${isThisSelected() ? 0.9 : isActive() ? 1 : 0.5}) rotateY(${offset() * -45}deg) translateZ(${isActive() ? "100px" : "0px"})`,
                        "z-index": 20 - Math.abs(offset()),
                        opacity:
                          Math.abs(offset()) > 1 ? 0 : isActive() ? 1 : 0.3,
                        "pointer-events": isActive() ? "auto" : "none",
                      }}
                    >
                      <div
                        class={`w-[750px] h-[1150px] rounded-[60px] flex flex-col items-center justify-between p-12 transition-all duration-300 overflow-hidden ${isActive() ? "bg-white/5 border border-white/20" : "opacity-50 grayscale blur-[2px]"} ${isThisSelected() ? "bg-blue-500/30 border-blue-400 shadow-[0_0_120px_rgba(59,130,246,0.8)] scale-95" : "shadow-[0_0_100px_rgba(59,130,246,0.3)]"}`}
                      >
                        <Show when={isThisSelected()}>
                          <div class="absolute inset-0 bg-white/20 animate-ping pointer-events-none" />
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
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>

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
            navigate("/ipa");
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
