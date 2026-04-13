import { createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function ChooseGenderModel() {
  const navigate = useNavigate();

  // States
  const [selectedGender, setSelectedGender] = createSignal(null); // null, 1 (Male), 2 (Female)
  const [currentIndex, setCurrentIndex] = createSignal(0);

  // Drag/Swipe Logic States
  const [dragStartX, setDragStartX] = createSignal(null);
  const [dragOffset, setDragOffset] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);

  // Placeholder Data (Nanti tinggal ganti src-nya)
  const models = {
    1: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      label: `MALE ARMOR ${i + 1}`,
    })),
    2: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      label: `FEMALE ARMOR ${i + 1}`,
    })),
  };

  const getActiveModels = () => models[selectedGender()] || [];

  // Handlers
  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setCurrentIndex(0);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % getActiveModels().length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + getActiveModels().length) % getActiveModels().length,
    );
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
    navigate(`/take-photo-ai?gender=${selectedGender()}&modelId=${modelId}`);
  };

  return (
    <div class="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden italic">
      {/* 1. GENDER SELECTION STATE */}
      <Show when={selectedGender() === null}>
        <div class="flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-500">
          <div class="text-center space-y-2">
            <h2 class="text-xs font-black tracking-[0.5em] text-blue-500 uppercase">
              Step 01
            </h2>
            <h1 class="text-5xl font-black uppercase tracking-tighter italic">
              Select Identity
            </h1>
          </div>

          <div class="flex gap-8">
            <button
              onClick={() => handleGenderSelect(1)}
              class="w-64 h-80 border-2 border-white/10 rounded-[30px] flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
            >
              <div class="w-20 h-20 rounded-full bg-white/5 group-hover:scale-110 transition-transform"></div>
              <span class="font-black uppercase tracking-widest">Male</span>
            </button>

            <button
              onClick={() => handleGenderSelect(2)}
              class="w-64 h-80 border-2 border-white/10 rounded-[30px] flex flex-col items-center justify-center gap-4 hover:border-pink-500 hover:bg-pink-500/10 transition-all group"
            >
              <div class="w-20 h-20 rounded-full bg-white/5 group-hover:scale-110 transition-transform"></div>
              <span class="font-black uppercase tracking-widest">Female</span>
            </button>
          </div>
        </div>
      </Show>

      {/* 2. ARMOR SLIDER STATE */}
      <Show when={selectedGender() !== null}>
        <div class="relative w-full h-screen flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-10 duration-700">
          {/* Header */}
          <div class="absolute top-20 text-center z-30">
            <button
              onClick={() => setSelectedGender(null)}
              class="text-[10px] font-black text-gray-500 hover:text-white mb-4 block uppercase tracking-widest"
            >
              ← Change Gender
            </button>
            <h1 class="text-4xl font-black uppercase tracking-tighter">
              Choose Your Armor
            </h1>
          </div>

          {/* Carousel Wrapper */}
          <div
            class="relative flex items-center justify-center w-full h-[600px] cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <For each={getActiveModels()}>
              {(model, index) => {
                const offset = () => index() - currentIndex();
                const isActive = () => index() === currentIndex();

                return (
                  <div
                    onClick={() => isActive() && confirmSelection(model.id)}
                    class="absolute transition-all duration-500 ease-out select-none"
                    style={{
                      transform: `
                        translateX(${offset() * 350 + dragOffset()}px) 
                        scale(${isActive() ? 1 : 0.6}) 
                        rotateY(${offset() * -35}deg)
                      `,
                      "z-index": 20 - Math.abs(offset()),
                      opacity:
                        Math.abs(offset()) > 2 ? 0 : isActive() ? 1 : 0.4,
                      "pointer-events": isActive() ? "auto" : "none",
                    }}
                  >
                    {/* Placeholder Armor Card */}
                    <div
                      class={`
                      w-[400px] h-[550px] rounded-[40px] border-2 flex flex-col items-center justify-end p-10
                      ${isActive() ? "border-blue-500 bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.3)]" : "border-white/10 bg-white/5"}
                    `}
                    >
                      <span class="text-2xl font-black italic uppercase tracking-tighter">
                        {model.label}
                      </span>
                      <div class="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <Show when={isActive()}>
                          <div class="h-full bg-blue-500 animate-progress"></div>
                        </Show>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>

          {/* Navigation Buttons */}
          <div class="flex gap-20 mt-10 z-30">
            <button
              onClick={prevSlide}
              class="p-4 hover:scale-125 transition-transform opacity-50 hover:opacity-100 italic font-black"
            >
              PREV
            </button>
            <button
              onClick={nextSlide}
              class="p-4 hover:scale-125 transition-transform opacity-50 hover:opacity-100 italic font-black"
            >
              NEXT
            </button>
          </div>
        </div>
      </Show>

      {/* Decorative Background Elements */}
      <div class="absolute bottom-0 left-0 p-10 opacity-10">
        <div class="text-[80px] font-black leading-none">
          ARMOR
          <br />
          SYSTEM
        </div>
      </div>
    </div>
  );
}
