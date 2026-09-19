import { useCallback, useEffect, useRef, useState } from "react";
import ClassificationPanel from "../components/scanner/ClassificationPanel";
import LiveStream from "../components/scanner/LiveStream";
import TokenModal from "../components/scanner/TokenModal";
import { useDetection } from "../hooks/useDetection";
import { useDisposalToken } from "../hooks/useDisposalToken";
import { playChime } from "../utils/audio";
import { grabFrame } from "../utils/frame";

/**
 * Wires camera -> detection loop -> classification + disposal token.
 * Owns the <video> ref so the detection hook and the stream share one element.
 */
export default function ScannerPage({ camera, muted, onToggleMute }) {
  const videoRef = useRef(null);
  const captureUrlRef = useRef(null);
  const [lastCapture, setLastCapture] = useState(null);

  const { detection, latencyMs, error: detectionError } = useDetection(videoRef, camera.isLive);
  const disposal = useDisposalToken(detection);

  const handleCapture = useCallback(
    async (mirrored) => {
      const blob = await grabFrame(videoRef.current, { mirror: mirrored });
      if (!blob) return;
      if (captureUrlRef.current) URL.revokeObjectURL(captureUrlRef.current);
      captureUrlRef.current = URL.createObjectURL(blob);
      setLastCapture(captureUrlRef.current);
      if (!muted) playChime();
    },
    [muted]
  );

  useEffect(
    () => () => {
      if (captureUrlRef.current) URL.revokeObjectURL(captureUrlRef.current);
    },
    []
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LiveStream
            videoRef={videoRef}
            camera={camera}
            detection={detection}
            detectionError={detectionError}
            latencyMs={latencyMs}
            muted={muted}
            onToggleMute={onToggleMute}
            onCapture={handleCapture}
            lastCapture={lastCapture}
          />
        </div>
        <div className="lg:col-span-2">
          <ClassificationPanel
            detection={detection}
            tokenStatus={disposal.status}
            tokenError={disposal.error}
            onGenerateToken={disposal.issue}
          />
        </div>
      </div>

      {disposal.status === "ready" && <TokenModal token={disposal.token} onClose={disposal.clear} />}
    </>
  );
}
