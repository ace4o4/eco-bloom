# 🌿 Eco-Bloom

**A Circular Economy Platform for Material Reuse and Recycling**

[![Build Status](https://github.com/ace4o4/eco-bloom/actions/workflows/build.yml/badge.svg)](https://github.com/ace4o4/eco-bloom/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ace4o4/eco-bloom/releases)

---

## 📖 About

Eco-Bloom is a production-ready web platform that connects people to share, reuse, and recycle materials. Using AI-powered material detection and location-based matching, we make it easy to give your waste a second life.

### ✨ Key Features

- 🤖 **AI Material Detection** - Automatically classify materials using YOLOv5
- 🌍 **Resource Matching** - Connect people offering and seeking materials
- 📍 **Location-based Search** - Find materials near you with distance calculations
- 📝 **Listing Management** - Full CRUD operations for your listings
- 🔒 **Secure & Private** - Row-level security with Supabase
- 📱 **Responsive Design** - Works beautifully on all devices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Supabase account (free tier works)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ace4o4/eco-bloom.git
cd eco-bloom

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the app
npm run dev         # Frontend on http://localhost:8080
cd backend && uvicorn app:app --reload --port 8000  # Backend
```

Visit `http://localhost:8080` to see the app!

---

## 📦 What's Inside

```
eco-bloom/
├── src/                 # Frontend source
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities & services
│   └── services/       # API integrations
├── backend/            # Python FastAPI backend
│   ├── app.py         # Main application
│   └── models/        # YOLOv5 models
├── supabase/          # Database migrations
└── public/            # Static assets
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Supabase Client** - Database & auth

### Backend
- **FastAPI** - Python web framework
- **YOLOv5** - AI object detection
- **Uvicorn** - ASGI server
- **OpenCV** - Image processing

### Database & Services
- **Supabase** - PostgreSQL + Auth + Storage
- **PostGIS** - Geospatial extension
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

---

## 📚 Documentation

- **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** - Detailed v1.0 features
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide *(see artifacts)*

---

## 🎯 Usage

### For Users Offering Materials

1. Click **"Plant a Match"**
2. Choose **"I'm Offering"**
3. Capture/upload image of material
4. AI auto-fills details (edit if needed)
5. Submit listing
6. Wait for seekers to contact you!

### For Users Seeking Materials

1. Click **"Plant a Match"**
2. Choose **"I'm Seeking"**
3. Enter search criteria
4. Browse nearby listings
5. Contact the owner
6. Arrange pickup!

### Managing Your Listings

1. Go to **Dashboard**
2. Click **"My Listings"**
3. View, edit, or delete your listings

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **YOLOv5** by Ultralytics for object detection
- **Supabase** for the amazing backend platform
- **React** and **Vite** communities
- All contributors and testers

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ace4o4/eco-bloom/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ace4o4/eco-bloom/discussions)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=ace4o4/eco-bloom&type=Date)](https://star-history.com/#ace4o4/eco-bloom&Date)

---

**Made with 💚 for a sustainable future**

---

## 🗺️ Roadmap

- [x] v1.0 - Core features
- [ ] v1.1 - Push notifications & messaging
- [ ] v1.2 - Mobile app
- [ ] v2.0 - Community features

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.
