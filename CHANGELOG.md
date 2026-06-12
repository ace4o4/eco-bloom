# Changelog

All notable changes to Eco-Bloom will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-08

### Added
- 🎉 **Initial production release**
- 🤖 AI-powered material detection using YOLOv5
- 🌍 PlantMatch resource sharing platform
- 📊 Full Supabase database integration
- 📝 Listing management dashboard (view, edit, delete)
- 🗺️ Geolocation services with distance calculations
- 👤 User authentication and dashboard
- 🎨 Modern glassmorphism UI design
- 📱 Responsive layout for all devices
- 🔒 Row Level Security on database
- 📸 Image upload to Supabase Storage
- 🔍 Advanced search with filters
- 📍 Location-based listing search
- ✉️ Contact system for users
- 🌓 Dark mode support

### Fixed
- ✅ Database unit constraint validation
- ✅ TypeScript type safety (removed all `any` types)
- ✅ Category display with proper JOIN queries
- ✅ AI autofill unit mapping
- ✅ Form validation and error handling
- ✅ CORS configuration for production
- ✅ Build errors in GitHub Actions
- ✅ Mobile responsive issues

### Changed
- 📦 Optimized bundle size with code splitting
- ⚡ Improved database query performance with indexes
- 🎨 Enhanced UI/UX with better loading states
- 🔧 Updated dependencies to latest versions

### Technical
- React 18 + TypeScript
- Vite build tool
- Supabase (PostgreSQL + PostGIS)
- FastAPI backend
- YOLOv5 for AI detection
- TailwindCSS + Framer Motion
- Deployed on Vercel (frontend) + Render (backend)

---

## [Unreleased]

### Planned for v1.1
- Push notifications
- In-app messaging
- Advanced analytics
- Bulk operations
- CSV export
- Mobile app

[1.0.0]: https://github.com/ace4o4/eco-bloom/releases/tag/v1.0.0
