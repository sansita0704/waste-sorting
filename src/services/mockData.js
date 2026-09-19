// Everything here is placeholder data used while VITE_USE_MOCK=true.
// Delete this file once every service talks to the real backend.

export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

export const MOCK_DETECTION = {
  className: "PET Plastic Bottle",
  category: "Dry / Recyclable",
  confidence: 0.964,
  weightG: 28.5,
  grade: "PET-01",
  contamination: { level: "Low", label: "Clean", score: 0.14 },
  steps: [
    "Unscrew cap & separate collar.",
    "Rinse container of left-over liquid.",
    "Place bottle in Blue Dry-Waste Bin.",
  ],
  box: { x: 0.34, y: 0.22, w: 0.26, h: 0.56 },
};

export async function mockDetect(signal) {
  await wait(12 + Math.random() * 6, signal);
  const jitter = () => (Math.random() - 0.5) * 0.016;
  return {
    ...MOCK_DETECTION,
    box: { ...MOCK_DETECTION.box, x: MOCK_DETECTION.box.x + jitter(), y: MOCK_DETECTION.box.y + jitter() },
  };
}

export const MOCK_LEDGER = {
  points: 340,
  streakDays: 5,
  itemsScanned: 28,
  accuracyPct: 98.2,
  co2OffsetKg: 4.2,
  weekly: [
    { day: "Mon", items: 3 },
    { day: "Tue", items: 5 },
    { day: "Wed", items: 2 },
    { day: "Thu", items: 6 },
    { day: "Fri", items: 4 },
    { day: "Sat", items: 7 },
    { day: "Sun", items: 1 },
  ],
};

export const MOCK_HUB = {
  name: "GreenLoop Recycling Hub",
  distanceKm: 0.8,
  hours: "Open until 8:00 PM",
  lat: 26.9124,
  lng: 75.7873,
};

export const MOCK_LEADERBOARD = [
  { id: "1", name: "Aarav M.", points: 1280, streakDays: 21 },
  { id: "2", name: "Ishita R.", points: 1104, streakDays: 14 },
  { id: "3", name: "You", points: 340, streakDays: 5, isYou: true },
  { id: "4", name: "Kabir S.", points: 322, streakDays: 3 },
  { id: "5", name: "Meera T.", points: 298, streakDays: 6 },
];

export function mockToken(detection) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ECO-${detection.grade}-${rand}`;
}
