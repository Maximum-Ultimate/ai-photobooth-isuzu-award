import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import QRComponent from "../helper/QRComponent";

export default function TakePhotoAI() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const genderId = params.gender;
  const modelId = params.modelId;

  const [stream, setStream] = createSignal(null);
  const [isCaptured, setIsCaptured] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [countdown, setCountdown] = createSignal(null);
  const [photoBlob, setPhotoBlob] = createSignal(null);
  const [previewUrl, setPreviewUrl] = createSignal(null);
  const [resultPhoto, setResultPhoto] = createSignal(null);
  const [qrUrl, setQrUrl] = createSignal(null);

  let videoRef;
  let canvasRef;

  const BASE_URL = "http://localhost:8000";

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
      console.error(err);
    }
  };

  const stopCamera = () => {
    stream()
      ?.getTracks()
      .forEach((t) => t.stop());
  };

  const handleCapture = async () => {
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
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
        setPreviewUrl(URL.createObjectURL(blob));
        setPhotoBlob(blob);
        setIsCaptured(true);
      },
      "image/jpeg",
      0.95,
    );
  };

  // --- LOGIC BARU SESUAI REQUEST ---
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // --- STEP 1: Upload & Get Download Path ---
      // Sesuai screenshot Postman, endpoint ini butuh form-data
      const formData = new FormData();
      formData.append("photo", photoBlob(), "capture.jpg"); // Key-nya "photo" sesuai Postman
      formData.append("framing_option_int", 0); // Key framing
      formData.append("is_printed", "1"); // Key is_printed (string)

      const resDownload = await fetch(
        `${BASE_URL}/api/download-and-get-download-path`,
        {
          method: "POST", // Pakai POST karena ngirim file
          body: formData, // Jangan kasih headers Content-Type kalau pake FormData, browser otomatis set
        },
      );

      if (!resDownload.ok)
        throw new Error(`Upload/Download Path Failed (${resDownload.status})`);

      // Tunggu proses upload beres sebentar sebelum lanjut swap
      // (Opsional, tergantung backend lo seberapa cepet sinkronisasinya)

      // --- STEP 2: Swapface ---
      const resSwap = await fetch(`${BASE_URL}/swapface`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option: parseInt(modelId),
          gender: parseInt(genderId),
        }),
      });

      if (!resSwap.ok) {
        const errData = await resSwap.json();
        console.error("Swap Error Details:", errData);
        throw new Error(`Swapface Failed (${resSwap.status})`);
      }

      // --- STEP 3: Get Result & QR ---
      const [resPath, resQr] = await Promise.all([
        fetch(`${BASE_URL}/getresultpath`).then((r) => r.json()),
        fetch(`${BASE_URL}/getqrurl`).then((r) => r.json()),
      ]);

      if (resPath?.photo) {
        setResultPhoto(`${BASE_URL}/${resPath.url}`);
      } else {
        throw new Error("Result path empty");
      }

      if (resQr?.download_url) {
        setQrUrl(resQr.download_url);
      }
    } catch (err) {
      console.error("Process Error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPrintFlexible = async () => {
    try {
      await fetch(`${BASE_URL}/print-photo-flexible`);
      await fetch(`${BASE_URL}//api/print-toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_printed: true,
        }),
      });
      alert("Printing triggered via Backend!");
    } catch (err) {
      console.error("Print Error:", err);
    }
  };

  return (
    <div class="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-10 italic">
      <div class="relative flex flex-col items-center gap-8 w-full max-w-4xl">
        <div class="relative w-[500px] h-[700px] bg-black rounded-[40px] border-2 border-white/10 overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            autoplay
            playsinline
            class={`w-full h-full object-cover ${isCaptured() || resultPhoto() ? "hidden" : "block"} scale-x-[-1]`}
          />
          <Show when={countdown()}>
            <div class="absolute inset-0 flex items-center justify-center z-20">
              <span class="text-[200px] font-black animate-ping">
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
          <Show when={isLoading()}>
            <div class="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
              <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <span class="text-xs font-black animate-pulse uppercase tracking-widest">
                Processing AI
              </span>
            </div>
          </Show>
        </div>

        <div class="flex gap-6 h-20">
          <Show when={!isCaptured() && !countdown()}>
            <button
              onClick={handleCapture}
              class="px-12 py-5 bg-white text-black font-black uppercase rounded-2xl active:scale-90 transition-all"
            >
              Start Countdown
            </button>
          </Show>
          <Show when={isCaptured() && !resultPhoto() && !isLoading()}>
            <button
              onClick={() => setIsCaptured(false)}
              class="px-8 py-4 border border-white/20 rounded-xl font-black uppercase text-[10px]"
            >
              Retake
            </button>
            <button
              onClick={handleConfirm}
              class="px-12 py-4 bg-blue-600 rounded-xl font-black uppercase tracking-widest"
            >
              Generate AI
            </button>
          </Show>
        </div>

        <Show when={resultPhoto() && !isLoading()}>
          <div class="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 duration-700">
            <div class="bg-white p-4 rounded-[30px]">
              <QRComponent urlQr={qrUrl()} />
            </div>
            <div class="flex gap-4">
              <button
                onClick={triggerPrintFlexible}
                class="px-6 py-2 bg-green-600 text-[10px] font-black uppercase rounded-lg"
              >
                Print (Flexible)
              </button>
              <button
                onClick={() => navigate("/")}
                class="px-6 py-2 border border-white/20 text-[10px] font-black uppercase rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
