# EcoScan AI (Vision Sorting OS v2.4)

React + Vite + Tailwind + Lucide + WebRTC.

## Run
```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173  (camera needs localhost or HTTPS)
```

## Structure
```
src/
├── main.jsx / App.jsx        App shell: camera + mute state, page switching
├── config/                   env.js, constants.js, navigation.js
├── types/contracts.js        JSDoc shapes the UI expects (Detection, LedgerSummary, ...)
├── services/                 ALL backend / model access lives here
│   ├── http.js               fetch wrapper
│   ├── detectionService.js   <- plug your ML model in here
│   ├── disposalService.js    QR token + nearest hub
│   ├── ledgerService.js      EcoPoints summary + leaderboard
│   └── mockData.js           placeholder data (delete when backend is live)
├── hooks/
│   ├── useCamera.js          WebRTC getUserMedia lifecycle
│   ├── useDetection.js       frame -> model loop (no overlapping requests)
│   ├── useVideoViewport.js   maps frame coords -> element px through the cover-crop
│   ├── useMeasuredFps.js     real FPS from the video element
│   ├── useAsyncData.js       loading/error/data for any service call
│   └── useDisposalToken.js
├── components/
│   ├── ui/                   Card, Badge, ActionButton, StatTile, AsyncView
│   ├── layout/Header.jsx
│   ├── scanner/              LiveStream, BoundingBox, TelemetryBar, CameraPlaceholder,
│   │                         ClassificationPanel, ContaminationMeter, PrepChecklist,
│   │                         TokenModal, QrGlyph
│   ├── map/                  DropoffFinder, MapCanvas
│   ├── ledger/               EcoLedger, WeeklyActivityChart
│   └── leaderboard/          Leaderboard
├── pages/                    ScannerPage (wires everything), MapPage, AnalyticsPage, LeaderboardPage
└── utils/                    frame.js (video -> Blob), boxMapping.js (overlay geometry),
                              classVoter.js (steadies flickering classifications), audio.js
```

## Running the backend
```bash
cd backend
python -m venv venv && venv/Scripts/activate   # source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python main.py                                 # serves on http://127.0.0.1:8000
```
`npm run dev` proxies `/api` to that address (override with `VITE_API_PROXY`).
Check `GET /api/v1/health` to confirm the model loaded.

The backend reads these optional environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `ECOSCAN_MODEL_PATH` | auto-discovered in `backend/models/` | Checkpoint to load |
| `ECOSCAN_CONF` | `0.35` | Minimum confidence to report a detection |
| `ECOSCAN_IOU` | `0.45` | NMS IoU threshold |
| `ECOSCAN_IMGSZ` | `640` | Inference size (the size the model was trained at) |
| `ECOSCAN_DEVICE` | auto | e.g. `cpu`, `0` for the first GPU |
| `ECOSCAN_CORS_ORIGINS` | localhost + LAN | Comma-separated allowlist |

## Connecting your model and backend
The UI calls the real backend by default; set `VITE_USE_MOCK=true` in `.env` to
demo it without one. Each service has an adapter that maps your response to the
UI shape, so only that one function changes if your format differs.

| Purpose | Endpoint | Service |
|---|---|---|
| Classify a frame | `POST /api/v1/detect` (multipart `frame` JPEG) | `detectionService.detect` |
| Issue QR token | `POST /api/v1/disposal-tokens` | `disposalService.createDisposalToken` |
| Nearest hub | `GET /api/v1/hubs/nearest` | `disposalService.getNearestHub` |
| EcoPoints summary | `GET /api/v1/ledger/summary` | `ledgerService.getLedgerSummary` |
| Leaderboard | `GET /api/v1/leaderboard` | `ledgerService.getLeaderboard` |

`/detect` response. The top level describes the most prominent item; `detections`
lists every box with that item first. Omit `label` when nothing is found. `bbox`
is normalised 0..1 with a top-left origin, measured on the un-mirrored frame:
```json
{
  "label": "PET Plastic Bottle", "category": "Dry / Recyclable",
  "confidence": 0.964, "weight_g": 28.5, "material_grade": "PET-01",
  "contamination": { "level": "Low", "label": "Clean", "score": 0.14 },
  "steps": ["Unscrew cap & separate collar.", "..."],
  "bbox": { "x": 0.34, "y": 0.22, "w": 0.26, "h": 0.56 },
  "detections": [
    { "class_name": "plastic_bottle", "label": "PET Plastic Bottle",
      "category": "Dry / Recyclable", "confidence": 0.964,
      "bbox": { "x": 0.34, "y": 0.22, "w": 0.26, "h": 0.56 }, "score": 0.71 }
  ],
  "frame": { "w": 640, "h": 480 }
}
```
"Most prominent" is not simply the top confidence: a large, centred object beats
a marginally more confident speck in a corner, since that is the item the user is
holding up to the camera.

**In-browser inference instead of HTTP:** in `detectionService.detect`, pass the
`video` element straight to ONNX Runtime Web / TensorFlow.js and map the output
through `toDetection`. Nothing else changes.

**Stability:** the model classifies every frame from scratch with no memory of
the last one, so on a live feed it flips between close classes (say
`plastic_bottle` and `glass_bottle`) from tick to tick. Showing that raw output
makes the detail panel unreadable. `utils/classVoter.js` runs a rolling-window
vote with hysteresis over the last `DETECTION_VOTE_WINDOW` ticks:

- A class needs `DETECTION_ADOPT_VOTES` to take over the panel — set above half
  the window, so two alternating classes deadlock instead of trading the lead.
- It only needs `DETECTION_KEEP_VOTES` to stay. A single bar for both would let
  a noisy stretch blank the panel out, and a reading that keeps vanishing is as
  unreadable as one that keeps changing.

A class that genuinely wins the window still takes over right away, so swapping
the object in front of the camera is still responsive (~1s).

**Tuning** (`config/constants.js`): `DETECTION_INTERVAL_MS` sets how often frames
are sent; `BOX_SMOOTHING` and `CONFIDENCE_SMOOTHING` damp the box and the
percentage against jitter once a class is on screen.

**Overlay geometry:** the video is drawn with `object-fit: cover`, so the element
shows a centre-crop of the frame whenever the camera's aspect ratio differs from
the card's. `utils/boxMapping.js` maps normalised boxes through that crop —
treating them as plain percentages of the element puts a 4:3 webcam's boxes ~19%
of the card height off target.

## Placeholders to replace
- `QrGlyph` is a visual stand-in. Use a real QR encoder (e.g. `qrcode.react`).
- `MapCanvas` is a static mock. Swap for Leaflet/Mapbox with `hub.lat` / `hub.lng`.
- The "HEVC" label is display-only; browsers don't expose the stream codec.
- Auth, geolocation and saving captures to the backend aren't wired yet.
