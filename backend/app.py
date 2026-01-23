"""
FastAPI server for Florence-2 Object Detection
Replaces YOLOv5 with Microsoft's Vision-Language Model
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoProcessor, AutoModelForCausalLM
import torch
import base64
import io
import traceback
import sys
from PIL import Image
from utils.material_mapper import format_detection_response

# Initialize FastAPI app
app = FastAPI(
    title="Eco-Bloom AI Detection API",
    description="Florence-2 Vision-Language Model for precise material detection",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Florence-2 Model
print("📦 Loading Microsoft Florence-2-base model...")
MODEL_ID = "microsoft/Florence-2-base"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🚀 Running on device: {DEVICE}")

try:
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID, 
        trust_remote_code=True,
        attn_implementation="eager"
    ).to(DEVICE)
    processor = AutoProcessor.from_pretrained(
        MODEL_ID, 
        trust_remote_code=True
    )
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Failed to load model.")
    print("--------------------------------------------------")
    traceback.print_exc()
    print("--------------------------------------------------")
    print("💡 Suggestion: Try running 'pip install -r requirements.txt --upgrade' again.")
    sys.exit(1) # Stop server so user notices
    model = None
    processor = None


class DetectionRequest(BaseModel):
    image: str  # Base64 encoded image

@app.get("/")
async def root():
    return {
        "message": "Eco-Bloom AI Detection API",
        "status": "running",
        "model": "Florence-2-base"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": DEVICE
    }

@app.post("/detect")
async def detect_objects(request: DetectionRequest):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")

        print("📸 Received detection request...")
        
        # Decode image
        try:
            image_data = request.image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

        # Run Florence-2 Detection
        print("🔍 Running Florence-2 Object Detection...")
        
        task_prompt = "<OD>" # Object Detection Task
        
        print(f"👉 Pre-processing image (Size: {image.size})...")
        inputs = processor(text=task_prompt, images=image, return_tensors="pt").to(DEVICE)
        print("👉 Image processed. Generating tokens...")

        # Generate with scores to calculate confidence
        generated_ids = model.generate(
            input_ids=inputs["input_ids"],
            pixel_values=inputs["pixel_values"],
            max_new_tokens=1024,
            do_sample=False,
            num_beams=1,
            use_cache=False,
            output_scores=True,
            return_dict_in_generate=True
        )
        print("👉 Tokens generated. Decoding...")
        
        # Calculate confidence
        transition_scores = model.compute_transition_scores(
            generated_ids.sequences, generated_ids.scores, normalize_logits=True
        )
        
        # We only really care about the confidence of the whole sequence for now, 
        # or we could try to map it to specific parts. 
        # For simplicity, we'll take the average probability of the generated tokens.
        import numpy as np
        
        # exp(score) gives probability
        generated_probs = torch.exp(transition_scores).cpu().numpy()
        avg_confidence = np.mean(generated_probs)
        print(f"👉 Computed Confidence: {avg_confidence:.4f}")

        generated_text = processor.batch_decode(generated_ids.sequences, skip_special_tokens=False)[0]
        print(f"👉 Decoded Text: {generated_text[:50]}...")
        
        # FIX: Ensure image_size is strictly integers in (w, h) format
        img_w, img_h = image.size
        print(f"👉 Post-processing with size: {(img_w, img_h)}")
        
        parsed_answer = processor.post_process_generation(
            generated_text, 
            task=task_prompt, 
            image_size=(img_w, img_h)
        )
        print("👉 Post-processing done.")
        
        # Format results for simple-mapper compatibility
        # Florence-2 returns { '<OD>': { 'bboxes': [[x,y,x,y]], 'labels': ['label'] } }
        
        prediction = parsed_answer.get(task_prompt, {})
        bboxes = prediction.get('bboxes', [])
        labels = prediction.get('labels', [])
        
        detections = []
        for bbox, label in zip(bboxes, labels):
            detections.append({
                'class': label,
                'confidence': float(avg_confidence), # Use calculated confidence
                'box': bbox,
                'label': label # Keep label just in case
            })
            print(f"  - Detected: {label} (Conf: {avg_confidence:.2f})")

        print(f"✅ Found {len(detections)} objects")
        
        # Helper to format for Frontend
        response = format_detection_response(detections)
        return response

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}\nTraceback: {traceback.format_exc()}")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    print(f"📍 Server running on port {port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
