import { FlipHorizontal } from "lucide-react";
import { STREAM_CODEC_LABEL } from "../../config/constants";

function Reading({ label, value }) {
  return (
    <span>
      {label}: <b className="text-emerald-400">{value}</b>
    </span>
  );
}

export default function TelemetryBar({ isLive, fps, latencyMs, height, mirrored, onToggleMirror }) {
  const dash = "—";
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-zinc-950/90 to-transparent px-4 pb-3 pt-10 font-mono text-xs">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-zinc-300">
        <Reading label="FPS" value={isLive && fps ? fps : dash} />
        <Reading label="Latency" value={isLive && latencyMs != null ? `${latencyMs}ms` : dash} />
        <Reading label="Stream" value={isLive && height ? `${height}p ${STREAM_CODEC_LABEL}` : dash} />
      </div>
      <button
        type="button"
        onClick={onToggleMirror}
        aria-pressed={mirrored}
        aria-label="Flip video horizontally"
        className={`rounded-md border p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          mirrored ? "border-emerald-500/40 text-emerald-400" : "border-zinc-700 text-zinc-400 hover:text-white"
        }`}
      >
        <FlipHorizontal size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
