import { useNavigate } from "@solidjs/router";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden text-white italic p-10">
      {/* Background Decor */}
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black opacity-[0.02] select-none italic tracking-tighter">
        404
      </div>

      <div class="relative z-10 flex flex-col items-center text-center gap-6">
        <div class="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest">
          Error: Address Not Found
        </div>

        <h1 class="text-6xl font-black uppercase tracking-tighter leading-none">
          SYSTEM <span class="text-red-500">BREACHED</span>
        </h1>

        <p class="text-gray-500 text-sm font-medium tracking-widest uppercase max-w-sm">
          The requested module does not exist in the current directory.
        </p>

        <button
          onClick={() => navigate("/", { replace: true })}
          class="mt-8 group relative px-10 py-4 overflow-hidden border border-white/20 rounded-xl transition-all hover:border-white"
        >
          {/* Fill effect */}
          <div class="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>

          <span class="relative z-10 text-xs font-black uppercase tracking-[0.3em] group-hover:text-black transition-colors">
            Reboot to Home
          </span>
        </button>
      </div>

      {/* Red Glitch Glow */}
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none"></div>
    </div>
  );
}
