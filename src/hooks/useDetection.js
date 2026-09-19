import { useEffect, useState } from "react";
import { DETECTION_INTERVAL_MS } from "../config/constants";
import { detect } from "../services/detectionService";

/**
 * Sends frames from the <video> to detectionService on a fixed cadence.
 * - Requests never overlap (next tick is scheduled after the previous finishes).
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
    const controller = new AbortController();

    const tick = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        const startedAt = performance.now();
        try {
          const result = await detect(video, { signal: controller.signal });
          if (cancelled) return;
          setDetection(result);
          setLatencyMs(Math.round(performance.now() - startedAt));
          setError(null);
        } catch (err) {
          if (cancelled || err.name === "AbortError") return;
          setError(err);
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
