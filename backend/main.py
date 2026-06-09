from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import random
import os
from dotenv import load_dotenv

# Robustly load .env files — try UTF-8 then fall back to UTF-16 (Windows BOMs)
try:
    load_dotenv(encoding="utf-8")
except UnicodeDecodeError:
    load_dotenv(encoding="utf-16")

app = FastAPI(title="ClearVision AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mock results pool ─────────────────────────────────────────
MOCK_RESULTS = [
    {
        "overall_result": "Healthy",
        "risk_level": "Low",
        "conditions": [
            {"name": "No abnormalities detected", "confidence": 0.96, "description": "Retinal structure appears normal with no signs of disease."}
        ],
        "observations": [
            "Clear optic disc with sharp margins",
            "Normal retinal vasculature pattern",
            "No haemorrhages or exudates visible",
            "Macula appears healthy and well-defined"
        ],
        "recommendations": [
            "Continue routine annual eye examinations",
            "Maintain good screen hygiene with the 20-20-20 rule",
            "Wear UV-protective sunglasses outdoors",
            "Stay hydrated to support tear film health"
        ],
        "disclaimer": "This is an AI-assisted preliminary assessment only. Please consult a qualified ophthalmologist for clinical diagnosis."
    },
    {
        "overall_result": "Monitor",
        "risk_level": "Medium",
        "conditions": [
            {"name": "Mild digital eye strain", "confidence": 0.78, "description": "Signs consistent with prolonged screen exposure."},
            {"name": "Early dry eye markers", "confidence": 0.61, "description": "Reduced tear film stability observed."}
        ],
        "observations": [
            "Slight irregularity in tear film distribution",
            "Minor conjunctival redness noted",
            "Optic disc appears normal",
            "No signs of retinal degeneration"
        ],
        "recommendations": [
            "Schedule a follow-up with an optometrist within 3 months",
            "Use preservative-free lubricating eye drops daily",
            "Reduce screen brightness and enable night mode after 7PM",
            "Take regular breaks — follow the 20-20-20 rule",
            "Increase omega-3 intake through diet or supplements"
        ],
        "disclaimer": "This is an AI-assisted preliminary assessment only. Please consult a qualified ophthalmologist for clinical diagnosis."
    },
    {
        "overall_result": "Concern",
        "risk_level": "High",
        "conditions": [
            {"name": "Possible diabetic retinopathy markers", "confidence": 0.72, "description": "Microaneurysms and small haemorrhages detected near the macula."},
            {"name": "Elevated IOP indicators", "confidence": 0.58, "description": "Optic disc cupping ratio suggests possible elevated intraocular pressure."}
        ],
        "observations": [
            "Small dot haemorrhages visible in posterior pole",
            "Optic disc cupping ratio appears elevated",
            "Retinal vessels show slight calibre irregularity",
            "Hard exudates present near the macula"
        ],
        "recommendations": [
            "Seek urgent ophthalmologist consultation within 2 weeks",
            "Request tonometry to measure intraocular pressure",
            "Blood glucose monitoring recommended if diabetic",
            "Avoid strenuous physical activity until reviewed",
            "Do not delay — early treatment significantly improves outcomes"
        ],
        "disclaimer": "This is an AI-assisted preliminary assessment only. Please consult a qualified ophthalmologist for clinical diagnosis."
    }
]


def is_retinal_image(image: Image.Image) -> bool:
    # Heuristic for retinal scans: strong red/orange bias, moderate brightness,
    # and many pixels with red dominance.
    image = image.resize((128, 128)).convert("RGB")
    pixels = list(image.getdata())
    red_sum = green_sum = blue_sum = 0
    red_dominant = 0

    for r, g, b in pixels:
        red_sum += r
        green_sum += g
        blue_sum += b
        if r > 90 and r > g + 15 and r > b + 15:
            red_dominant += 1

    total = len(pixels)
    if total == 0:
        return False

    avg_red = red_sum / total
    avg_green = green_sum / total
    avg_blue = blue_sum / total
    avg_brightness = (avg_red + avg_green + avg_blue) / 3
    red_ratio = red_dominant / total

    if avg_brightness < 45 or avg_brightness > 230:
        return False
    if avg_red < 90:
        return False
    if avg_red <= avg_green * 1.1 or avg_red <= avg_blue * 1.1:
        return False
    if red_ratio < 0.25:
        return False

    return True


@app.get("/")
def root():
    return {"message": "ClearVision AI Backend Running", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok", "ai_ready": True, "message": "Mock AI mode active"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/webp"}
    content_type = file.content_type or ""
    if content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{content_type}' not accepted. Use JPEG, PNG or WebP."
        )

    contents = await file.read()

    # Validate size
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 10MB")

    # Validate it opens as a real image
    try:
        image = Image.open(io.BytesIO(contents))
        width, height = image.size
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read image: {str(e)}")

    if not is_retinal_image(image):
        raise HTTPException(
            status_code=400,
            detail="Uploaded image does not appear to be a retinal scan. Please upload a clear eye image.",
        )

    # Use image size to seed result so same image always returns same result
    # This makes demos look more realistic
    seed = (width * height) % 3
    analysis = MOCK_RESULTS[seed]

    return {
        "success": True,
        "filename": file.filename,
        "image_size": {"width": width, "height": height},
        "analysis": analysis,
    }