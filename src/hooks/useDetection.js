import { useEffect, useState } from "react";
import {
  BOX_SMOOTHING,
  DETECTION_HOLD_MS,
  DETECTION_INTERVAL_MS,
  MAX_CONSECUTIVE_ERRORS,
} from "../config/constants";
import { detect } from "../services/detectionService";

/** Exponential moving average so the box glides instead of jittering frame to frame. */
function smoothBox(prev, next) {
  if (!prev) return next;
  const a = BOX_SMOOTHING;
  return {
    x: prev.x + (next.x - prev.x) * a,
    y: prev.y + (next.y - prev.y) * a,
    w: prev.w + (next.w - prev.w) * a,
    h: prev.h + (next.h - prev.h) * a,
  };
}

/**
 * Sends frames from the <video> to detectionService on a fixed cadence.
 * - Requests never overlap (next tick is scheduled after the previous finishes).
 * - A hit is held for DETECTION_HOLD_MS after it disappears, so a single missed
 *   frame doesn't make the overlay strobe.
 * - `latencyMs` is the real round-trip of the last successful call.
 * - Cleans up (abort + clear) when disabled or unmounted.
 */
export function useDetection(videoRef, enabled) {
  const [detection, setDetection] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setDetection(null);
      setLatencyMs(null);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    let timer;
    let held = null;
    let lastHitAt = 0;
    let failures = 0;
    const controller = new AbortController();

    const tick = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        const startedAt = performance.now();
        try {
          const result = await detect(video, { signal: controller.signal });
          if (cancelled) return;
          const now = performance.now();

          if (result) {
            const box =
              held?.className === result.className ? smoothBox(held.box, result.box) : result.box;
            held = { ...result, box };
            lastHitAt = now;
            setDetection(held);
          } else if (!held || now - lastHitAt >= DETECTION_HOLD_MS) {
            held = null;
            setDetection(null);
          }

          setLatencyMs(Math.round(now - startedAt));
          failures = 0;
          setError(null);
        } catch (err) {
          if (cancelled || err.name === "AbortError") return;
          failures += 1;
          setError(err);
          // Don't leave a stale box pinned over the feed once the model is gone.
          if (failures >= MAX_CONSECUTIVE_ERRORS) {
            held = null;
            setDetection(null);
          }
        }
      }
      if (!cancelled) timer = setTimeout(tick, DETECTION_INTERVAL_MS);
    };

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [videoRef, enabled]);

  return { detection, latencyMs, error };
}
