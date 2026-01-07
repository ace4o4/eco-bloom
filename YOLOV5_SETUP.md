# YOLOv5 Backend Setup & Usage Guide

## 🚀 Quick Start

### Step 1: Backend Setup

1. **Open NEW terminal** (keep React running in the other one)

2. **Navigate to backend:**
```bash
cd backend
```

3. **Create virtual environment:**
```bash
python -m venv venv
```

4. **Activate virtual environment:**
```bash
# Windows
venv\Scripts\activate

# You should see (venv) in your terminal
```

5. **Install dependencies:**
```bash
pip install -r requirements.txt
```

*Note: This will take 2-3 minutes. YOLOv5 model (~15MB) will auto-download on first run.*

6. **Start backend server:**
```bash
python app.py
```

You should see:
```
🚀 Starting Eco-Bloom AI Detection API...
📍 Server will run on: http://localhost:8000
📦 Loading YOLOv5 model...
✅ Model loaded successfully!
```

### Step 2: Frontend Setup

Your React app should already be running. If not:

```bash
# In another terminal (not the backend one)
npm run dev
```

### Step 3: Test It!

1. Go to `http://localhost:5173/eco-bloom/plant-match`
2. Select "I'm Offering" or "I'm Seeking"  
3. Click camera or upload image
4. Watch AI magic! 🪄

---

## 📡 API Endpoints

- **POST** `/detect` - Detect objects in image
- **GET** `/health` - Check if API is running
- **GET** `/` - API info

**API Docs:** http://localhost:8000/docs

---

## ⚙️ ENV Configuration

Add to `.env`:
```env
VITE_API_URL=http://localhost:8000
```

---

## 🔧 Troubleshooting

**❌ Backend not starting?**
- Make sure Python 3.8+ installed: `python --version`
- Virtual environment activated? Look for `(venv)` in terminal
- Port 8000 already in use? Change port in `app.py`

**❌ Frontend can't connect to backend?**
- Backend running? Check http://localhost:8000/health
- CORS error? Backend has CORS enabled for localhost:5173 and :8080
- Check `.env` has `VITE_API_URL=http://localhost:8000`

**❌ "AI analysis failed" error?**
- Check backend terminal for errors
- Try uploading different image
- Restart backend server

---

## 🎯 What Gets Detected?

YOLOv5 can detect 80+ objects including:
- ✅ Bottles, cups, bowls
- ✅ Electronics (phone, laptop, keyboard, etc.)
- ✅ Utensils (spoon, fork, knife)
- ✅ Books, scissors
- ✅ Furniture
- ✅ Food items  
- ✅ And more!

---

## 💾 Deactivating Virtual Environment

When done:
```bash
deactivate
```

---

## 📝 Remember:

**TWO SERVERS MUST BE RUNNING:**
1. **Backend** (Port 8000) - Python/YOLOv5
2. **Frontend** (Port 5173) - React/Vite

Keep both terminal windows open!
