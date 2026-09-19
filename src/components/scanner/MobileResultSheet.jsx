import { ChevronUp, X } from "lucide-react";
import { getBin } from "../../config/wasteTaxonomy";

/**
 * Mobile-only bottom sheet for the detection result.
 *
 * Collapsed it peeks above the tab bar with just the decision - item and bin -
 * so the camera keeps the screen. Expanded it covers the tab bar and scrolls
 * the full result. This is a different layout from desktop rather than a
 * narrowed copy of it.
 */
export default function MobileResultSheet({ open, onToggle, detection, children }) {
  if (!detection) return null;
  const bin = getBin(detection.category);
  const BinIcon = bin.icon;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close result"
          className="fixed inset-0 z-[55] bg-ink-950/70 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={`fixed inset-x-0 lg:hidden ${
          open
            ? // Sits above the tab bar: it's modal, with a backdrop and a close control.
              "bottom-0 top-[10vh] z-[60]"
            : "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30"
        }`}
      >
        <div className="flex h-full flex-col rounded-t-3xl border-t border-white/10 bg-ink-900 shadow-[0_-16px_48px_-16px_rgba(0,0,0,.85)]">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="relative flex shrink-0 items-center gap-3 rounded-t-3xl px-4 pb-3 pt-4 text-left"
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1.5 h-1 w-9 -translate-x-1/2 rounded-full bg-white/20"
            />

            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${bin.hex}22`, color: bin.hex }}
            >
              <BinIcon size={18} aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-white">
                {detection.className}
              </span>
              <span className="block truncate text-xs font-medium" style={{ color: bin.hex }}>
                {bin.label}
              </span>
            </span>

            <span className="shrink-0 text-slate-400">
              {open ? <X size={18} aria-hidden="true" /> : <ChevronUp size={18} aria-hidden="true" />}
            </span>
            <span className="sr-only">{open ? "Collapse result" : "Expand result"}</span>
          </button>

          {open && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
