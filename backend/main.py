import io
import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from ultralytics import YOLO

from waste_rules import get_waste_rule

BASE_DIR = Path(__file__).resolve().parent
MODEL_CANDIDATES = [
    BASE_DIR / "models" / "taco_best.pt",
    BASE_DIR / "models" / "ecoscan_best (1).pt",
    Path("backend/models/taco_best.pt"),
    Path("backend/models/ecoscan_best (1).pt"),
]


def resolve_model_path() -> Path:
    for candidate in MODEL_CANDIDATES:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        f"Could not find model file in candidate locations: {[str(p) for p in MODEL_CANDIDATES]}"
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = resolve_model_path()
    print(f"[Startup] Loading TACO YOLO model from: {model_path}")
    app.state.model = YOLO(str(model_path))
    app.state.classes = app.state.model.names
    print(f"[Startup] Model loaded successfully with {len(app.state.classes)} classes:")
    print(f"          {app.state.classes}")
    yield
    print("[Shutdown] Cleaning up resources...")


app = FastAPI(
    title="EcoScan AI Backend",
    version="1.0.0",
    description="Waste classification backend powered by Ultralytics YOLO & TACO dataset",
    lifespan=lifespan,
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend and model status."""
    is_loaded = hasattr(app.state, "model") and app.state.model is not None
    return {
        "status": "ok",
        "model_loaded": is_loaded,
        "classes": getattr(app.state, "classes", {}),
    }


@app.post("/api/v1/detect")
async def detect_waste(frame: UploadFile = File(...)):
    """
    Accepts multipart image field 'frame'.
    Runs YOLO inference on the image and returns detected waste category,
    confidence score, normalized bounding box, and preparation instructions.
    Returns None if no items are detected.
    """
    if not hasattr(app.state, "model") or app.state.model is None:
        raise HTTPException(status_code=503, detail="YOLO model is not initialized")

    try:
        image_bytes = await frame.read()
        if not image_bytes:
            return None

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # Run YOLO inference
    results = app.state.model.predict(image, conf=0.25, verbose=False)

    if not results or len(results[0].boxes) == 0:
        return None

    boxes = results[0].boxes
    # Select detection with the highest confidence
    best_box = max(boxes, key=lambda b: float(b.conf[0]))

    cls_id = int(best_box.cls[0])
    confidence = float(best_box.conf[0])
    class_name = app.state.model.names.get(cls_id, f"class_{cls_id}")

    # xyxyn gives normalized coordinates: [x1, y1, x2, y2] in 0..1 range
    x1, y1, x2, y2 = best_box.xyxyn[0].tolist()
    x = max(0.0, min(1.0, float(x1)))
    y = max(0.0, min(1.0, float(y1)))
    w = max(0.0, min(1.0, float(x2 - x1)))
    h = max(0.0, min(1.0, float(y2 - y1)))

    rule = get_waste_rule(class_name)

    return {
        "label": rule["label"],
        "category": rule["category"],
        "confidence": round(confidence, 3),
        "weight_g": rule["weight_g"],
        "material_grade": rule["material_grade"],
        "contamination": rule["contamination"],
        "steps": rule["steps"],
        "bbox": {
            "x": round(x, 4),
            "y": round(y, 4),
            "w": round(w, 4),
            "h": round(h, 4),
        },
    }


# =========================================================================
# Auxiliary endpoints to ensure full frontend functionality with real API
# =========================================================================

class DisposalTokenRequest(BaseModel):
    class_name: Optional[str] = None
    grade: Optional[str] = None


@app.post("/api/v1/disposal-tokens")
async def create_disposal_token(req: DisposalTokenRequest):
    """Generate QR disposal token for detected waste item."""
    grade = (req.grade or "GEN").replace(" ", "-")
    rand_code = uuid.uuid4().hex[:6].upper()
    return {"token": f"ECO-{grade}-{rand_code}"}


@app.get("/api/v1/hubs/nearest")
async def get_nearest_hub():
    """Return nearest drop-off hub."""
    return {
        "name": "GreenLoop Recycling Hub",
        "distance_km": 0.8,
        "hours": "Open until 8:00 PM",
        "lat": 26.9124,
        "lng": 75.7873,
    }


@app.get("/api/v1/ledger/summary")
async def get_ledger_summary():
    """Return scanning statistics and weekly impact summary."""
    return {
        "points": 340,
        "streak_days": 5,
        "items_scanned": 28,
        "accuracy_pct": 98.2,
        "co2_offset_kg": 4.2,
        "weekly": [
            {"day": "Mon", "items": 3},
            {"day": "Tue", "items": 5},
            {"day": "Wed", "items": 2},
            {"day": "Thu", "items": 6},
            {"day": "Fri", "items": 4},
            {"day": "Sat", "items": 7},
            {"day": "Sun", "items": 1},
        ],
    }


@app.get("/api/v1/leaderboard")
async def get_leaderboard():
    """Return community leaderboard."""
    return [
        {"id": "1", "name": "Aarav M.", "points": 1280, "streak_days": 21},
        {"id": "2", "name": "Ishita R.", "points": 1104, "streak_days": 14},
        {"id": "3", "name": "You", "points": 340, "streak_days": 5, "is_you": True},
        {"id": "4", "name": "Kabir S.", "points": 322, "streak_days": 3},
        {"id": "5", "name": "Meera T.", "points": 298, "streak_days": 6},
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
