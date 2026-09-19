import { useCallback, useEffect, useRef, useState } from "react";
import DetectionResultCard from "../components/scanner/DetectionResultCard";
import LiveStream from "../components/scanner/LiveStream";
import MobileResultSheet from "../components/scanner/MobileResultSheet";
import TokenModal from "../components/scanner/TokenModal";
import { useDetection } from "../hooks/useDetection";
import { useDisposalToken } from "../hooks/useDisposalToken";
import { playChime } from "../utils/audio";
import { grabFrame } from "../utils/frame";

/**
 * Wires camera -> detection loop -> classification + disposal token.
 * Owns the <video> ref so the detection hook and the stream share one element.
 */
export default function ScannerPage({ camera, muted, onToggleMute, onScan }) {
  const videoRef = useRef(null);
  const captureUrlRef = useRef(null);
  const [lastCapture, setLastCapture] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { detection, latencyMs, error: detectionError } = useDetection(videoRef, camera.isLive);
  const disposal = useDisposalToken(detection);

  // Log confirmed detections to the local impact ledger. `onScan` de-duplicates,
  // so one item held in frame counts once.
  useEffect(() => {
    onScan(detection);
  }, [detection, onScan]);

  // Collapse the mobile sheet when the item leaves the frame.
  useEffect(() => {
    if (!detection) setSheetOpen(false);
  }, [detection]);

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

  const result = (
    <DetectionResultCard
      detection={detection}
      isLive={camera.isLive}
      tokenStatus={disposal.status}
      tokenError={disposal.error}
      onGenerateToken={disposal.issue}
    />
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

        {/* Desktop: result sits beside the feed. */}
        <div className="hidden lg:col-span-2 lg:block">{result}</div>

        {/* Mobile: nothing detected yet, so show the prompt inline. */}
        {!detection && <div className="lg:hidden">{result}</div>}

        {/* Mobile: clearance so the collapsed sheet never covers page content. */}
        {detection && <div aria-hidden="true" className="h-16 lg:hidden" />}
      </div>

      {/* Mobile: a detected result becomes a bottom sheet over the camera. */}
      <MobileResultSheet
        open={sheetOpen}
        onToggle={() => setSheetOpen((o) => !o)}
        detection={detection}
      >
        {result}
      </MobileResultSheet>

      {disposal.status === "ready" && <TokenModal token={disposal.token} onClose={disposal.clear} />}
    </>
  );
}
