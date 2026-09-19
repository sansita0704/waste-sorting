import { AlertTriangle, CameraOff, Loader2 } from "lucide-react";
import { CAMERA_MESSAGES } from "../../config/constants";

/** Shown in place of the video when the camera is off, starting, denied or failed. */
export default function CameraPlaceholder({ status, onStart }) {
  const copy = CAMERA_MESSAGES[status];
  const failed = status === "denied" || status === "error" || status === "unsupported";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
        {failed ? (
          <AlertTriangle size={24} className="text-amber-400" aria-hidden="true" />
        ) : status === "starting" ? (
          <Loader2 size={24} className="animate-spin text-emerald-400" aria-hidden="true" />
        ) : (
          <CameraOff size={24} className="text-zinc-500" aria-hidden="true" />
        )}
      </div>
      <div role="status">
        <p className="font-medium text-white">{copy.title}</p>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{copy.body}</p>
      </div>
      {status !== "starting" && status !== "unsupported" && (
        <button
          type="button"
          onClick={onStart}
          className="mt-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          {status === "idle" ? "Launch WebCam" : "Try again"}
        </button>
      )}
    </div>
  );
}
