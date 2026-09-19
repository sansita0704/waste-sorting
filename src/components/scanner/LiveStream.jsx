import { useEffect, useState } from "react";
import { Aperture, Camera, CameraOff, ScanLine, Volume2, VolumeX } from "lucide-react";
import { useMeasuredFps } from "../../hooks/useMeasuredFps";
import ActionButton from "../ui/ActionButton";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import BoundingBox from "./BoundingBox";
import CameraPlaceholder from "./CameraPlaceholder";
import TelemetryBar from "./TelemetryBar";

/**
 * Presentational stream card. The parent owns `videoRef` (so the detection loop
 * can read frames from it) and all data; this component only attaches the
 * MediaStream and renders overlays.
 */
export default function LiveStream({
  videoRef,
  camera,
  detection,
  detectionError,
  latencyMs,
  muted,
  onToggleMute,
  onCapture,
  lastCapture,
}) {
  const [mirrored, setMirrored] = useState(true);
  const { stream, status, isLive, settings } = camera;
  const fps = useMeasuredFps(videoRef, isLive) || Math.round(settings?.frameRate ?? 0);

  // Attach (or detach) the MediaStream whenever it changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) video.play().catch(() => {});
  }, [stream, videoRef]);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full bg-zinc-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Live camera feed"
          className={`h-full w-full object-cover ${isLive ? "" : "hidden"}`}
          style={{ transform: mirrored ? "scaleX(-1)" : "none" }}
        />

        {!isLive && <CameraPlaceholder status={status} onStart={camera.start} />}

        {isLive && (
          <>
            <div className="absolute left-4 top-4">
              <Badge>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                LIVE
              </Badge>
            </div>
            <div className="absolute right-4 top-4">
              {detectionError ? (
                <Badge tone="red">Model unreachable</Badge>
              ) : (
                <Badge tone="zinc">
                  <ScanLine size={12} aria-hidden="true" /> {detection ? "Detecting" : "Searching"}
                </Badge>
              )}
            </div>
            <BoundingBox detection={detection} mirrored={mirrored} />
          </>
        )}

        <TelemetryBar
          isLive={isLive}
          fps={fps}
          latencyMs={latencyMs}
          height={settings?.height}
          mirrored={mirrored}
          onToggleMirror={() => setMirrored((m) => !m)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 p-4">
        <ActionButton
          icon={isLive ? CameraOff : Camera}
          label="Toggle Camera"
          onClick={camera.toggle}
          active={isLive}
        />
        <ActionButton
          icon={Aperture}
          label="Capture Frame"
          onClick={() => onCapture(mirrored)}
          disabled={!isLive}
        />
        <ActionButton
          icon={muted ? VolumeX : Volume2}
          label={muted ? "Alerts Muted" : "Mute Alerts"}
          onClick={onToggleMute}
          active={muted}
        />
        {lastCapture && (
          <div className="ml-auto flex items-center gap-2">
            <img
              src={lastCapture}
              alt="Most recent captured frame"
              className="h-10 w-16 rounded-md border border-zinc-700 object-cover"
            />
            <span className="text-xs text-zinc-500">Frame saved</span>
          </div>
        )}
      </div>
    </Card>
  );
}
