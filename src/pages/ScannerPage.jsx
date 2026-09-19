import { useCallback, useEffect, useRef, useState } from "react";
import AdvicePanel from "../components/scanner/AdvicePanel";
import DetectionResultCard from "../components/scanner/DetectionResultCard";
import LiveStream from "../components/scanner/LiveStream";
import MobileResultSheet from "../components/scanner/MobileResultSheet";
import TokenModal from "../components/scanner/TokenModal";
import { ADVICE_MIN_CONFIDENCE } from "../config/constants";
import { getMaterial } from "../config/wasteTaxonomy";
import { useDetection } from "../hooks/useDetection";
import { useDisposalAdvice } from "../hooks/useDisposalAdvice";
import { useDisposalToken } from "../hooks/useDisposalToken";
import { useGeolocation } from "../hooks/useGeolocation";
import { playChime } from "../utils/audio";
import { grabFrame } from "../utils/frame";

/**
 * Wires camera -> detection loop -> classification, advice and disposal token.
 * Owns the <video> ref so the detection hook and the stream share one element.
 */
export default function ScannerPage({ camera, muted, onToggleMute, onScan }) {
  const videoRef = useRef(null);
  const captureUrlRef = useRef(null);
  const [lastCapture, setLastCapture] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { detection, latencyMs, error: detectionError } = useDetection(videoRef, camera.isLive);
  const disposal = useDisposalToken(detection);
  const { location, resolve: resolveLocation } = useGeolocation();

  const material = detection ? getMaterial(detection.rawClass)?.id ?? null : null;
  const adviceQuery = useDisposalAdvice(detection, { material, location });

  // Advice is requested per confirmed item, never per frame. Location is
  // resolved first and passed straight through: reading it back from state in
  // the same turn would still hold the previous render's fallback coordinates.
  const { request: requestAdviceFor } = adviceQuery;
  const requestAdvice = useCallback(async () => {
    const fresh = await resolveLocation();
    requestAdviceFor(fresh);
  }, [resolveLocation, requestAdviceFor]);

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

  const confident = (detection?.confidence ?? 0) >= ADVICE_MIN_CONFIDENCE;

  const result = (
    <DetectionResultCard
      detection={detection}
      isLive={camera.isLive}
      tokenStatus={disposal.status}
      tokenError={disposal.error}
      onGenerateToken={disposal.issue}
      advice={
        detection && (
          <AdvicePanel
            status={adviceQuery.status}
            advice={adviceQuery.advice}
            error={adviceQuery.error}
            onRequest={requestAdvice}
            onRetry={requestAdvice}
            canRequest={confident}
            reason={`Confidence is ${((detection.confidence ?? 0) * 100).toFixed(0)}%. Hold the item steadier and better lit, then scan again for advice.`}
          />
        )
      }
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
