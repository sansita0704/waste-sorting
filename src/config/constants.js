export const ACCENT = "#10B981";
export const LOCATION_LABEL = "Jaipur, IN";

// How often a frame is sent to the model (ms). Requests never overlap:
// the next one is scheduled only after the previous one finishes.
export const DETECTION_INTERVAL_MS = 200;

// How many recent ticks are considered when deciding what to display. A class
// must win a majority of this window to appear (or to stay shown), which is
// what keeps a single flickered misclassification from swapping the panel.
// Larger = steadier but slower to react; smaller = snappier but jitterier.
// Keep this EVEN: with an odd window two alternating classes still hand the
// majority back and forth every tick, which is the exact thrash this prevents.
export const DETECTION_VOTE_WINDOW = 6;

// Votes (out of DETECTION_VOTE_WINDOW) a class needs to take over the panel.
// Must beat half the window outright (see createClassVoter's guard) so two
// alternating classes deadlock at 3-3 instead of trading the lead every tick.
export const DETECTION_ADOPT_VOTES = 4;

// Votes the class already on screen needs to stay there. Deliberately much
// lower than the adopt bar: a noisy stretch should not blank the panel out,
// since a reading that keeps vanishing is as unreadable as one that keeps
// changing. Lower = clings longer after the object leaves.
export const DETECTION_KEEP_VOTES = 2;

// Weight of the newest reading in the box/confidence smoothing average (0..1),
// applied only while the same class keeps winning. Lower = steadier but
// laggier; higher = snappier but jitterier.
export const BOX_SMOOTHING = 0.45;
export const CONFIDENCE_SMOOTHING = 0.35;

// Consecutive failed requests before the stale reading is cleared off the feed.
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
