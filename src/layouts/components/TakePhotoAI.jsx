import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import QRComponent from "../helper/QRComponent";

export default function TakePhotoAI() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const genderId = params.gender;
  const modelId = params.modelId;

  // States
  const [stream, setStream] = createSignal(null);
  const [isCaptured, setIsCaptured] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [countdown, setCountdown] = createSignal(null); // State countdown
  const [photoBlob, setPhotoBlob] = createSignal(null);
  const [previewUrl, setPreviewUrl] = createSignal(null);
  const [resultPhoto, setResultPhoto] = createSignal(null);
  const [qrUrl, setQrUrl] = createSignal(null);

  let videoRef;
  let canvasRef;

  onMount(async () => {
    await startCamera();
  });

  onCleanup(() => {
    stopCamera();
    if (previewUrl()) URL.revokeObjectURL(previewUrl());
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1080, height: 1920, facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      videoRef.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera Error:", err);
    }
  };

  const stopCamera = () => {
    stream()
      ?.getTracks()
      .forEach((track) => track.stop());
  };

  // FUNGSI CAPTURE DENGAN COUNTDOWN
  const handleCapture = async () => {
    // 1. Mulai Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      // Lo bisa taruh SFX Beep di sini nanti
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 2. Clear Countdown & Jepret
    setCountdown(null);
    executeCapture();
  };

  const executeCapture = () => {
    const context = canvasRef.getContext("2d");
    canvasRef.width = videoRef.videoWidth;
    canvasRef.height = videoRef.videoHeight;

    context.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);

    canvasRef.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPhotoBlob(blob);
        setIsCaptured(true);
      },
      "image/jpeg",
      0.95,
    );
  };

  const handleRetake = () => {
    setIsCaptured(false);
    setPreviewUrl(null);
    setPhotoBlob(null);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", photoBlob(), "capture.jpg");

      await fetch("http://localhost:8000/upload-raw", {
        method: "POST",
        body: formData,
      });

      await fetch("http://localhost:8000/swapface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: modelId, gender: genderId }),
      });

      const [resPath, resQr] = await Promise.all([
        fetch("http://localhost:8000/getresultpath").then((r) => r.json()),
        fetch("http://localhost:8000/getqrurl").then((r) => r.json()),
      ]);

      setResultPhoto(`http://localhost:8000/${resPath.photo}`);
      setQrUrl(resQr.download_url);
    } catch (err) {
      console.error("Process Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-10 italic">
      {/* HEADER INFO */}
      <div class="absolute top-10 flex gap-10 opacity-30">
        <span class="text-[10px] font-black tracking-[0.4em] uppercase">
          Model ID: {modelId}
        </span>
        <span class="text-[10px] font-black tracking-[0.4em] uppercase">
          Gender: {genderId == 1 ? "Male" : "Female"}
        </span>
      </div>

      <div class="relative flex flex-col items-center gap-8 w-full max-w-4xl">
        {/* CAMERA / PREVIEW BOX */}
        <div class="relative w-[500px] h-[700px] bg-black rounded-[40px] border-2 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <video
            ref={videoRef}
            autoplay
            playsinline
            class={`w-full h-full object-cover ${isCaptured() || resultPhoto() ? "hidden" : "block"} scale-x-[-1]`}
          />

          {/* COUNTDOWN OVERLAY */}
          <Show when={countdown() !== null}>
            <div class="absolute inset-0 flex items-center justify-center z-20">
              <span class="text-[200px] font-black text-white animate-ping drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                {countdown()}
              </span>
            </div>
          </Show>

          <Show when={isCaptured() && !resultPhoto()}>
            <img
              src={previewUrl()}
              class="w-full h-full object-cover scale-x-[-1]"
            />
          </Show>

          <Show when={resultPhoto()}>
            <img
              src={resultPhoto()}
              class="w-full h-full object-cover animate-in fade-in duration-1000"
            />
          </Show>

          <canvas ref={canvasRef} class="hidden" />

          {/* PROCESSING OVERLAY */}
          <Show when={isLoading()}>
            <div class="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
              <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span class="text-xs font-black tracking-widest animate-pulse">
                PROCESSING AI
              </span>
            </div>
          </Show>
        </div>

        {/* CONTROLS */}
        <div class="flex gap-6 h-20">
          <Show when={!isCaptured() && countdown() === null}>
            <button
              onClick={handleCapture}
              class="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-90"
            >
              Start Countdown
            </button>
          </Show>

          <Show when={isCaptured() && !resultPhoto() && !isLoading()}>
            <button
              onClick={handleRetake}
              class="px-8 py-4 border border-white/20 rounded-xl font-black uppercase text-[10px] active:scale-95"
            >
              Retake
            </button>
            <button
              onClick={handleConfirm}
              class="px-12 py-4 bg-blue-600 rounded-xl font-black uppercase tracking-widest active:scale-95"
            >
              Generate AI
            </button>
          </Show>
        </div>

        {/* RESULT & QR */}
        <Show when={resultPhoto() && !isLoading()}>
          <div class="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 duration-700">
            <div class="bg-white p-4 rounded-[30px]">
              <QRComponent urlQr={qrUrl()} />
            </div>
            <button
              onClick={() => navigate("/")}
              class="text-xs font-black border-b-2 border-white pb-1 tracking-widest uppercase"
            >
              Done / Start Over
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
