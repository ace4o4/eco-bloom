"""
FastAPI server for YOLOv5 object detection
Provides API endpoints for material detection in eco-bloom app
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import base64
import io
from PIL import Image
import numpy as np
from utils.material_mapper import format_detection_response

# Initialize FastAPI app
app = FastAPI(
    title="Eco-Bloom AI Detection API",
    description="YOLOv5-based object detection for recyclable materials",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv5 model (will download on first run)
print("📦 Loading YOLOv5 model...")
model = YOLO('yolov5s.pt')  # Using small model for speed
print("✅ Model loaded successfully!")


# Request model
class DetectionRequest(BaseModel):
    image: str  # Base64 encoded image


# Response models
class Detection(BaseModel):
    class_name: str
    confidence: float
    bbox: list[float]


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Eco-Bloom AI Detection API",
        "status": "running",
        "model": "YOLOv5s"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post("/detect")
async def detect_objects(request: DetectionRequest):
    """
    Detect objects in uploaded image
    
    Args:
        request: DetectionRequest with base64 encoded image
    
    Returns:
        Detection results with material information
    """
    try:
        print("📸 Received detection request...")
        
        # Decode base64 image
        try:
            # Remove data:image/jpeg;base64, prefix if present
            image_data = request.image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            print(f"✅ Image decoded: {image.size}")
            
        except Exception as e:
            print(f"❌ Image decode error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
        
        # Run YOLOv5 detection
        print("🔍 Running YOLOv5 detection...")
        results = model(image)
        
        # Extract detections
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detection = {
                    'class': result.names[int(box.cls[0])],
                    'confidence': float(box.conf[0]),
                    'bbox': box.xyxy[0].tolist()
                }
                detections.append(detection)
                print(f"  - Detected: {detection['class']} ({detection['confidence']:.2f})")
        
        print(f"✅ Found {len(detections)} objects")
        
        # Format response with material information
        response = format_detection_response(detections)
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", 8000))
    print("🚀 Starting Eco-Bloom AI Detection API...")
    print(f"📍 Server will run on: http://0.0.0.0:{port}")
    print(f"📖 API docs: http://0.0.0.0:{port}/docs")
    
    # Reload functionality is useful for dev but 'reload=True' implies specific worker handling. 
    # Usually fine for dev, but in prod we might want it off or controlled. 
    # For now, matching previous behavior but with explicit host/port.
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
