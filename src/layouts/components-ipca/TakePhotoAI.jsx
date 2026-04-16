import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import QRComponent from "../helper/QRComponent";

// Background & Assets
import backgroundMain from "../../assets/img-ipca/bgMain.webp";
import frameCam from "../../assets/img-ipca/frame.webp";
import frameCam2 from "../../assets/img-ipca/frame2.webp";
import buttonIdle from "../../assets/img-ipca/buttonIdle.webp";
import buttonClicked from "../../assets/img-ipca/buttonClicked.webp";
import buttonIdle2 from "../../assets/img-ipca/buttonIdle2.webp";
import buttonClicked2 from "../../assets/img-ipca/buttonClicked2.webp";

// SFX Asset
import sfxBtnFile from "../../assets/sfx/sfxbtn.wav";

export default function TakePhotoAI() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const genderId = params.gender;
  const modelId = params.modelId;

  // --- 🔊 SFX HELPER ---
  const playSfx = () => {
    const sfx = new Audio(sfxBtnFile);
    sfx.volume = 0.6;
    sfx.play().catch((err) => console.warn("SFX failed:", err));
  };

  const [stream, setStream] = createSignal(null);
  const [isCaptured, setIsCaptured] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [countdown, setCountdown] = createSignal(null);
  const [photoBlob, setPhotoBlob] = createSignal(null);
  const [previewUrl, setPreviewUrl] = createSignal(null);
  const [resultPhoto, setResultPhoto] = createSignal(null);
  const [qrUrl, setQrUrl] = createSignal(null);

  const [btnLeftActive, setBtnLeftActive] = createSignal(false);
  const [btnRightActive, setBtnRightActive] = createSignal(false);

  let videoRef;
  let canvasRef;
  const BASE_URL = "http://localhost:6241";

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
    playSfx();
    setBtnRightActive(true);
    setTimeout(async () => {
      setBtnRightActive(false);
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCountdown(null);
      executeCapture();
    }, 200);
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

  const handleConfirm = async () => {
    playSfx();
    setBtnRightActive(true);

    setTimeout(async () => {
      setBtnRightActive(false);
      setIsLoading(true);

      try {
        // --- STEP 1: Upload Awal ---
        const formData = new FormData();
        formData.append("photo", photoBlob(), "capture.jpg");
        formData.append("framing_option_int", 0);
        formData.append("is_printed", "1");
        formData.append("ipa_vs_ipca", "1");

        const resUploadInitial = await fetch(
          `${BASE_URL}/api/download-and-get-download-path`,
          { method: "POST", body: formData },
        );
        if (!resUploadInitial.ok) throw new Error("Upload Failed");

        // --- STEP 2: Swapface ---
        const resSwap = await fetch(`${BASE_URL}/swapface`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            option: parseInt(modelId),
            gender: parseInt(genderId),
          }),
        });
        if (!resSwap.ok) throw new Error("AI Process Failed");

        // --- STEP 3: Ambil Path Hasil (Tampilkan Foto Dulu) ---
        const resResult = await fetch(`${BASE_URL}/getresultpath`).then((r) =>
          r.json(),
        );

        if (resResult && resResult.url) {
          // LANGSUNG TAMPILIN FOTO
          setResultPhoto(`${BASE_URL}/${resResult.url}`);
          setIsLoading(false); // Matikan loading screen utama

          // --- STEP 4: Proses Upload QR di Background ---
          // Kita panggil ini tanpa menghambat tampilan foto
          try {
            // Di dalam handleConfirm TakePhotoAI.jsx
            const confirmRes = await fetch(
              `${BASE_URL}/upload-confirm-photo/without-waiting`,
            ).then((r) => r.json());

            // Ambil photo_url dari response JSON lo
            if (confirmRes && confirmRes.photo_url) {
              const finalQrLink = `https://gallery.isuzuawards.com/download?photo=${confirmRes.photo_url}&type=${isIPA() ? "ipa" : "ipca"}`;
              setQrUrl(finalQrLink);
            }
            setQrUrl(finalQrLink);
          } catch (qrErr) {
            console.error("QR Upload Error:", qrErr);
          }
        } else {
          throw new Error("Result Path not found");
        }
      } catch (err) {
        console.error("Process Error:", err);
        alert("Error: " + err.message);
        setIsLoading(false);
      }
    }, 200);
  };

  const triggerPrintFlexible = async () => {
    try {
      await fetch(`${BASE_URL}/print-photo-flexible`);
      await fetch(`${BASE_URL}/api/print-toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_printed: true }),
      });
    } catch (err) {
      console.error("Print Error:", err);
    }
  };

  const CustomButton = (props) => (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      class={`relative w-[300px] h-[100px] transition-all duration-200 flex items-center justify-center overflow-hidden active:scale-90 ${props.active ? "brightness-75" : "brightness-100 hover:scale-105"}`}
      style={{
        "background-image": `url(${props.active ? props.imgClicked : props.imgIdle})`,
        "background-size": "contain",
        "background-position": "center",
        "background-repeat": "no-repeat",
        "font-family": "FontIsuzuBold",
      }}
    >
      <span
        class={`relative z-10 text-xl font-black uppercase tracking-widest pt-1 ${props.active ? "text-gray-300 translate-y-1" : "text-white"}`}
      >
        {props.label}
      </span>
    </button>
  );

  return (
    <div
      class="min-h-screen w-full text-white flex flex-col items-center justify-center relative overflow-hidden italic"
      style={{
        "font-family": "FontIsuzuBold",
        "background-image": `url(${backgroundMain})`,
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      <div class="relative flex flex-col items-center gap-12 w-full max-w-4xl z-10">
        <h2 class="text-6xl font-black uppercase tracking-wide shadow-blue-500 drop-shadow-lg">
          {isCaptured()
            ? resultPhoto()
              ? "HASIL FOTO"
              : "TINJAU FOTO"
            : "BERSIAP!"}
        </h2>

        {/* CAMERA / FRAME BOX */}
        <div class="relative w-[650px] h-[850px] flex items-center justify-center">
          {/* 1. LAYER RESULT (FULL - DI ATAS SEMUA) */}
          <Show when={resultPhoto()}>
            <div class="absolute inset-0 z-50 animate-in fade-in duration-1000">
              <img
                src={resultPhoto()}
                class="w-full h-full scale-[0.85] object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]"
              />
            </div>
          </Show>

          {/* 2. Gambar Frame Dekorasi */}
          <img
            src={frameCam2}
            class="absolute inset-0 w-full h-full z-10 pointer-events-none object-contain"
          />

          {/* 3. Container Masking (Hanya untuk Video & Preview Ambil Foto) */}
          <div
            class={`bg-black overflow-hidden relative w-[99%] h-[98%] ${resultPhoto() ? "opacity-0" : "opacity-100"}`}
            style={{
              "-webkit-mask-image": `url(${frameCam})`,
              "mask-image": `url(${frameCam})`,
              "mask-mode": "luminance",
              "-webkit-mask-mode": "luminance",
              "mask-type": "luminance",
              "-webkit-mask-size": "contain",
              "mask-size": "contain",
              "mask-repeat": "no-repeat",
              "mask-position": "center",
            }}
          >
            {/* Video Live */}
            <video
              ref={videoRef}
              autoplay
              playsinline
              class={`w-full h-full object-cover ${isCaptured() || resultPhoto() ? "hidden" : "block"} scale-x-[-1]`}
            />

            {/* Countdown */}
            <Show when={countdown()}>
              <div class="absolute inset-0 flex items-center justify-center z-30">
                <span class="text-[200px] font-black text-white animate-ping drop-shadow-2xl">
                  {countdown()}
                </span>
              </div>
            </Show>

            {/* Preview Foto (Sebelum AI) - Masih kena masking biar konsisten */}
            <Show when={isCaptured() && !resultPhoto()}>
              <img
                src={previewUrl()}
                class="w-full h-full object-cover scale-x-[-1]"
              />
            </Show>

            {/* Loading AI Overlay */}
            <Show when={isLoading()}>
              <div class="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-40">
                <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <span class="text-xl font-black animate-pulse uppercase tracking-[0.3em]">
                  Processing AI...
                </span>
              </div>
            </Show>
          </div>
        </div>

        {/* --- BUTTONS SECTION --- */}
        <div class="flex gap-10 h-32 items-center">
          <Show when={!isCaptured() && !countdown()}>
            <CustomButton
              label="Kembali"
              imgIdle={buttonIdle2}
              imgClicked={buttonClicked2}
              active={btnLeftActive()}
              onClick={() => {
                playSfx();
                setBtnLeftActive(true);
                setTimeout(() => navigate("/choose-gender-model"), 200);
              }}
            />
            <CustomButton
              label="Ambil Foto"
              imgIdle={buttonIdle}
              imgClicked={buttonClicked}
              active={btnRightActive()}
              onClick={handleCapture}
            />
          </Show>

          <Show when={isCaptured() && !resultPhoto() && !isLoading()}>
            <CustomButton
              label="Ambil Ulang"
              imgIdle={buttonIdle2}
              imgClicked={buttonClicked2}
              active={btnLeftActive()}
              onClick={() => {
                playSfx();
                setBtnLeftActive(true);
                setTimeout(() => {
                  setBtnLeftActive(false);
                  setIsCaptured(false);
                }, 200);
              }}
            />
            <CustomButton
              label="Proses Foto"
              imgIdle={buttonIdle}
              imgClicked={buttonClicked}
              active={btnRightActive()}
              onClick={handleConfirm}
            />
          </Show>

          {/* STEP 3: RESULT & QR */}
          <Show when={resultPhoto() && !isLoading()}>
            <div class="flex flex-col items-center gap-10 animate-in slide-in-from-bottom-5 mt-12">
              <div class="flex items-center gap-10">
                <div class="bg-white p-3 rounded-3xl shadow-2xl transform scale-110 flex items-center justify-center min-w-[150px] min-h-[150px]">
                  <Show
                    when={qrUrl()}
                    fallback={
                      <div class="flex flex-col items-center">
                        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span class="text-[8px] text-black font-bold mt-2">
                          GENERATE QR...
                        </span>
                      </div>
                    }
                  >
                    <QRComponent urlQr={qrUrl()} />
                  </Show>
                </div>
                <h2
                  class="max-w-[400px] text-left text-4xl font-black uppercase tracking-tighter leading-none"
                  style={{ "font-family": "FontIsuzuBold" }}
                >
                  {qrUrl()
                    ? "SILAHKAN SCAN QR CODE UNTUK DOWNLOAD"
                    : "MOHON TUNGGU, QR SEDANG DIPROSES..."}
                </h2>
              </div>
              <div class="flex gap-10">
                <CustomButton
                  label="Menu Utama"
                  imgIdle={buttonIdle2}
                  imgClicked={buttonClicked2}
                  active={btnRightActive()}
                  onClick={() => {
                    playSfx();
                    setBtnRightActive(true);
                    setTimeout(() => navigate("/"), 200);
                  }}
                />
              </div>
            </div>
          </Show>
        </div>
      </div>
      <canvas ref={canvasRef} class="hidden" />
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-60" />
    </div>
  );
}
