export const ACCENT = "#10B981";
export const LOCATION_LABEL = "Jaipur, IN";

// How often a frame is sent to the model (ms). Requests never overlap:
// the next one is scheduled only after the previous one finishes.
export const DETECTION_INTERVAL_MS = 200;

// Keep showing the last hit this long after it stops being detected, so a
// single dropped frame doesn't blink the overlay off and on.
export const DETECTION_HOLD_MS = 700;

// Weight of the newest box in the smoothing average (0..1). Lower = steadier
// but laggier; higher = snappier but jitterier.
export const BOX_SMOOTHING = 0.45;

// Consecutive failed requests before the stale box is cleared off the feed.
export const MAX_CONSECUTIVE_ERRORS = 3;

// Display-only. Browsers don't expose the codec of a getUserMedia stream.
export const STREAM_CODEC_LABEL = "HEVC";

export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: "user",
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 60 },
  },
  audio: false,
};

export const CAMERA_MESSAGES = {
  idle: { title: "Camera is off", body: "Launch the webcam to start scanning items in real time." },
  starting: { title: "Starting camera…", body: "Waiting for camera access." },
  denied: {
    title: "Camera access blocked",
    body: "Allow camera permission in your browser's site settings, then launch again.",
  },
  error: {
    title: "Camera unavailable",
    body: "No camera was found, or another app is using it. Check the connection and retry.",
  },
  unsupported: {
    title: "Camera not supported",
    body: "This browser can't access a webcam. Use a current browser over HTTPS.",
  },
};
