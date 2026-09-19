import { ACCENT } from "../../config/constants";
import { mapBoxToViewport } from "../../utils/boxMapping";

const CORNERS = [
  "left-0 top-0 border-l-2 border-t-2",
  "right-0 top-0 border-r-2 border-t-2",
  "left-0 bottom-0 border-l-2 border-b-2",
  "right-0 bottom-0 border-r-2 border-b-2",
];

function Box({ rect, label, confidence, primary }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-md transition-[left,top,width,height] duration-150 ease-out ${
        primary ? "border-2" : "border"
      }`}
      style={{
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderColor: primary ? ACCENT : `${ACCENT}80`,
        boxShadow: primary ? `0 0 24px ${ACCENT}55` : "none",
      }}
    >
      <span
        className={`absolute -left-0.5 whitespace-nowrap rounded-t-md px-2 py-1 font-semibold ${
          primary
            ? "-top-7 bg-emerald-500 text-xs text-zinc-950"
            : "-top-5 bg-emerald-500/70 text-[10px] text-zinc-950"
        }`}
      >
        {label} {(confidence * 100).toFixed(1)}%
      </span>
      {primary && CORNERS.map((c) => <span key={c} className={`absolute h-3 w-3 border-white ${c}`} />)}
    </div>
  );
}

/**
 * Draws the primary detection plus any secondary ones over the video.
 * Renders nothing until the viewport mapping is known.
 */
export default function BoundingBox({ detection, mirrored = false, viewport }) {
  if (!detection?.box || !viewport) return null;

  const secondary = (detection.detections ?? []).slice(1).filter((d) => d?.box);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {secondary.map((d, i) => (
        <Box
          key={`${d.className}-${i}`}
          rect={mapBoxToViewport(d.box, viewport, mirrored)}
          label={d.className}
          confidence={d.confidence}
          primary={false}
        />
      ))}
      <Box
        rect={mapBoxToViewport(detection.box, viewport, mirrored)}
        label={detection.className}
        confidence={detection.confidence}
        primary
      />
    </div>
  );
}

