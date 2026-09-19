import { Camera, CameraOff, Leaf, Loader2, MapPin } from "lucide-react";
import { ACCENT, LOCATION_LABEL } from "../../config/constants";
import { NAV_ITEMS } from "../../config/navigation";
import Badge from "../ui/Badge";

export default function Header({ view, onNavigate, camera }) {
  const running = camera.isLive || camera.status === "starting";

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <Leaf size={18} style={{ color: ACCENT }} aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold tracking-tight text-white">EcoScan AI</p>
            <p className="text-xs text-zinc-500">Vision Sorting OS v2.4</p>
          </div>
        </div>

        <nav aria-label="Primary" className="order-3 w-full lg:order-none lg:w-auto">
          <ul className="flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const current = view === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(id)}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      current ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" style={current ? { color: ACCENT } : undefined} />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Badge tone="zinc">
            <MapPin size={12} aria-hidden="true" /> {LOCATION_LABEL}
          </Badge>
          <button
            type="button"
            onClick={camera.toggle}
            disabled={camera.status === "starting"}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-60 ${
              running
                ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            }`}
          >
            {camera.status === "starting" ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : running ? (
              <CameraOff size={16} aria-hidden="true" />
            ) : (
              <Camera size={16} aria-hidden="true" />
            )}
            {running ? "Stop Camera" : "Launch WebCam"}
          </button>
        </div>
      </div>
    </header>
  );
}
