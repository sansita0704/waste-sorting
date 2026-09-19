import { useCallback, useEffect, useRef, useState } from "react";
import { getDisposalAdvice } from "../services/adviceService";

const IDLE = { status: "idle", advice: null, error: null };

/**
 * Fetches disposal advice for a confirmed detection.
 *
 * Deliberately manual: `request()` is wired to a button, so a model call
 * happens once per item the user actually asks about rather than on every
 * camera frame. Any in-flight request is aborted if the item changes or the
 * component unmounts.
 *
 * status: idle | loading | ready | error
 */
export function useDisposalAdvice(detection, { material, location } = {}) {
  const [state, setState] = useState(IDLE);
  const controllerRef = useRef(null);
  const key = detection ? `${detection.rawClass ?? detection.className}` : null;

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  // A different item invalidates whatever was on screen.
  useEffect(() => {
    abort();
    setState(IDLE);
  }, [key, abort]);

  useEffect(() => abort, [abort]);

  /** @param {{lat:number, lon:number}} [overrideLocation] freshly resolved coords */
  const request = useCallback(async (overrideLocation) => {
    if (!detection) return;
    abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: "loading", advice: null, error: null });

    try {
      const advice = await getDisposalAdvice(
        detection,
        { material, location: overrideLocation ?? location },
        { signal: controller.signal }
      );
      if (controller.signal.aborted) return;
      setState({ status: "ready", advice, error: null });
    } catch (error) {
      if (controller.signal.aborted || error.name === "AbortError") return;
      setState({ status: "error", advice: null, error });
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [detection, material, location, abort]);

  const reset = useCallback(() => {
    abort();
    setState(IDLE);
  }, [abort]);

  return { ...state, request, reset };
}
