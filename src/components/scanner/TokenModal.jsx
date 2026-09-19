import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import QrGlyph from "./QrGlyph";

export default function TokenModal({ token, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="token-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center"
      >
        <div className="flex items-start justify-between">
          <h2 id="token-title" className="text-lg font-semibold text-white">
            Disposal token ready
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-zinc-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <QrGlyph value={token} />
        </div>
        <p className="mt-4 font-mono text-sm text-emerald-400">{token}</p>
        <p className="mt-2 text-sm text-zinc-500">
          Scan this at any partner bin to log the drop-off and earn EcoPoints.
        </p>
      </div>
    </div>
  );
}
