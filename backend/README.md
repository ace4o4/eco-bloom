# YOLOv5 Backend API

FastAPI server for object detection using YOLOv5.

## Setup

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
```

2. **Activate virtual environment:**
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

Note: First run will download YOLOv5 model (~15MB)

## Run Server

```bash
python app.py
```

Server will start on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

### POST /detect
Detect objects in image and return material information.

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "success": true,
  "detections": [...],
  "material": {
    "materialType": "Plastic Bottle",
    "title": "Plastic Bottle For Recycling",
    "description": "Plastic Bottle in good condition...",
    "isRecyclable": true,
    "suggestedCategory": "plastic",
    "confidence": 0.92,
    "estimatedWeight": "50g"
  }
}
```

### GET /health
Health check endpoint.

## Usage

Keep this server running while using the eco-bloom frontend.
