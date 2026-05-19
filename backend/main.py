from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import random

app = FastAPI()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "ClearVision AI Backend Running"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()

    image = Image.open(io.BytesIO(contents))

    width, height = image.size

    # Temporary fake AI result
    predictions = [
        {
            "result": "Healthy",
            "risk_level": "Low",
            "condition_notes": "No visible abnormalities detected."
        },
        {
            "result": "Monitor",
            "risk_level": "Medium",
            "condition_notes": "Minor retinal irregularities detected."
        },
        {
            "result": "Concern",
            "risk_level": "High",
            "condition_notes": "Possible diabetic retinopathy signs detected."
        }
    ]

    prediction = random.choice(predictions)

    return {
        "filename": file.filename,
        "image_size": {
            "width": width,
            "height": height
        },
        **prediction
    }