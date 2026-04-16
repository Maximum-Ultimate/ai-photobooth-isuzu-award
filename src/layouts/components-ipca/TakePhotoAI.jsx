import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import QRComponent from "../helper/QRComponent";

// Background & Assets
import backgroundMain from "../../assets/img-ipca/bgMain.webp";
import frameCam from "../../assets/img-ipca/frame.webp"; // Frame dekorasi kamera
import frameCam2 from "../../assets/img-ipca/frame2.webp"; // Frame dekorasi kamera
import buttonIdle from "../../assets/img-ipca/buttonIdle.webp";
import buttonClicked from "../../assets/img-ipca/buttonClicked.webp";
import buttonIdle2 from "../../assets/img-ipca/buttonIdle2.webp";
import buttonClicked2 from "../../assets/img-ipca/buttonClicked2.webp";

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

  // Button States untuk visual feedback (Shrink & Image Switch)
  const [btnLeftActive, setBtnLeftActive] = createSignal(false);
  const [btnRightActive, setBtnRightActive] = createSignal(false);

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
    setBtnRightActive(true);
    setTimeout(async () => {
      setBtnRightActive(false);
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("photo", photoBlob(), "capture.jpg");
        formData.append("framing_option_int", 0);
        formData.append("is_printed", "1");

        const resDownload = await fetch(
          `${BASE_URL}/api/download-and-get-download-path`,
          { method: "POST", body: formData },
        );
        if (!resDownload.ok) throw new Error("Upload Failed");

        const resSwap = await fetch(`${BASE_URL}/swapface`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            option: parseInt(modelId),
            gender: parseInt(genderId),
          }),
        });
        if (!resSwap.ok) throw new Error("AI Process Failed");

        const [resPath, resQr] = await Promise.all([
          fetch(`${BASE_URL}/getresultpath`).then((r) => r.json()),
          fetch(`${BASE_URL}/getqrurl`).then((r) => r.json()),
        ]);

        setResultPhoto(`${BASE_URL}/${resPath.url}`);
        setQrUrl(resQr.download_url);
      } catch (err) {
        alert(err.message);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  // Reusable Button Component untuk dalem sini
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
      class="min-h-screen w-full text-white flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        "font-family": "FontIsuzuBold",
        "background-image": `url(${backgroundMain})`,
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      {/* HEADER INFO */}
      {/* <div class="absolute top-14 text-center z-10">
        <h2 class="text-4xl font-black uppercase tracking-widest shadow-blue-500 drop-shadow-lg">
          {isCaptured()
            ? resultPhoto()
              ? "HASIL FOTO"
              : "TINJAU FOTO"
            : "BERSIAP!"}
        </h2>
      </div> */}

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
          {/* 1. Gambar Frame (Tetap sebagai dekorasi paling atas) */}
          <img
            src={frameCam2}
            class="absolute inset-0 w-full h-full z-0 pointer-events-none object-contain"
          />

          {/* 2. Container Video dengan MASKING LUMINANCE */}
          <div
            class="bg-black overflow-hidden relative"
            style={{
              /* --- INI KUNCINYA --- */
              "-webkit-mask-image": `url(${frameCam})`, // Pake file frame yang tengahnya PUTIH SOLID
              "mask-image": `url(${frameCam})`,

              /* Paksa browser pake mode Luminance (Putih=Tampil, Hitam=Hilang) */
              "mask-mode": "luminance",
              "-webkit-mask-mode": "luminance",
              "mask-type": "luminance",

              "-webkit-mask-size": "contain",
              "mask-size": "contain",
              "-webkit-mask-repeat": "no-repeat",
              "mask-repeat": "no-repeat",
              "-webkit-mask-position": "center",
              "mask-position": "center",
            }}
          >
            {/* Video / Preview / Result tetep di dalem sini, otomatis kepotong presisi */}
            <video
              ref={videoRef}
              autoplay
              playsinline
              class={`w-full h-full object-cover ${isCaptured() || resultPhoto() ? "hidden" : "block"} scale-x-[-1]`}
            />

            <Show when={countdown()}>
              <div class="absolute inset-0 flex items-center justify-center z-30">
                <span class="text-[200px] font-black text-white animate-ping drop-shadow-2xl">
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
          {/* STEP 1: INITIAL CAMERA */}
          <Show when={!isCaptured() && !countdown()}>
            <CustomButton
              label="Kembali"
              imgIdle={buttonIdle2}
              imgClicked={buttonClicked2}
              active={btnLeftActive()}
              onClick={() => {
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

          {/* STEP 2: PREVIEW AFTER CAPTURE */}
          <Show when={isCaptured() && !resultPhoto() && !isLoading()}>
            <CustomButton
              label="Ambil Ulang"
              imgIdle={buttonIdle2}
              imgClicked={buttonClicked2}
              active={btnLeftActive()}
              onClick={() => {
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
              <div class="flex items-center gap-5">
                <div class="bg-white rounded-3xl shadow-2xl">
                  <QRComponent urlQr={"test"} />
                </div>
                <h2
                  class="max-w-[400px] text-left text-5xl font-bold uppercase tracking-wide mt-4 mb-6"
                  style={{ "font-family": "FontIsuzuLight" }}
                >
                  SILAHKAN SCAN QR CODE UNTUK DOWNLOAD
                </h2>
              </div>
              <div class="flex gap-10">
                <CustomButton
                  label="Cetak Foto"
                  imgIdle={buttonIdle}
                  imgClicked={buttonClicked}
                  active={btnLeftActive()}
                  onClick={async () => {
                    setBtnLeftActive(true);
                    await triggerPrintFlexible();
                    setTimeout(() => setBtnLeftActive(false), 500);
                  }}
                />
                <CustomButton
                  label="Menu Utama"
                  imgIdle={buttonIdle2}
                  imgClicked={buttonClicked2}
                  active={btnRightActive()}
                  onClick={() => {
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

      {/* Cinematic Vignette */}
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-60" />
    </div>
  );
}
