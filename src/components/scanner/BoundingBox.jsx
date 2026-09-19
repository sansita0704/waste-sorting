import { ACCENT } from "../../config/constants";

const CORNERS = [
  "left-0 top-0 border-l-2 border-t-2",
  "right-0 top-0 border-r-2 border-t-2",
  "left-0 bottom-0 border-l-2 border-b-2",
  "right-0 bottom-0 border-r-2 border-b-2",
];

/** Draws a detection's normalised (0..1) box over the video. Renders nothing without one. */
export default function BoundingBox({ detection, mirrored = false }) {
  if (!detection?.box) return null;
  const { x, y, w, h } = detection.box;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute rounded-md border-2 transition-all duration-200"
      style={{
        // The video is mirrored for the user, while frames sent to the model
        // are intentionally unmirrored. Mirror the x coordinate as well so
        // the box stays attached to the detected object.
        left: mirrored ? undefined : `${x * 100}%`,
        right: mirrored ? `${(1 - x - w) * 100}%` : undefined,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
        borderColor: ACCENT,
        boxShadow: `0 0 24px ${ACCENT}55`,
      }}
    >
      <span className="absolute -top-7 -left-0.5 whitespace-nowrap rounded-t-md bg-emerald-500 px-2 py-1 text-xs font-semibold text-zinc-950">
        {detection.className} {(detection.confidence * 100).toFixed(1)}%
      </span>
      {CORNERS.map((c) => (
        <span key={c} className={`absolute h-3 w-3 border-white ${c}`} />
      ))}
    </div>
  );
}
