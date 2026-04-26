# SPFIRE - Production-Ready Fitness Tracker

A full-stack fitness application inspired by Strava, featuring real-time GPS tracking, advanced analytics, and a gamified experience.

## 🚀 Teck Stack
- **Frontend**: React 19, Tailwind CSS, Recharts, Framer Motion
- **Backend**: Node.js, Express, Socket.io
- **Database/Auth**: Firebase (Firestore & Google Auth)
- **Maps**: Leaflet.js

## ✨ Features
- **Accurate Tracking**: GPS-based recording for runs, walks, and cycles.
- **Real-time Stats**: Live distance, pace, and speed updates.
- **Health Metrics**: BMI calculation and VO2 Max estimation.
- **Gamification**: XP system, levels, and activity streaks.
- **Analytics**: Weekly performance charts.
- **Strava UI**: High-contrast dark theme optimized for mobile.

## 🛠️ Setup Guide

### 1. Environment Variables
Ensure the following variables are set in your environment or `.env` file:
```env
GEMINI_API_KEY="your_api_key"
APP_URL="your_deployed_url"
```

### 2. Firebase Configuration
The project is already pre-configured with Firebase rules and hosting settings.
- **Rules**: `firestore.rules` containing hardened security.
- **Hosting**: `firebase.json` configured for SPA routing.

### 3. Running Locally
```bash
npm install
npm run dev
```

### 4. Deployment to Firebase
To deploy the frontend to Firebase Hosting:
```bash
npm run build
npx firebase deploy --only hosting
```

## 🔐 Security
- **Hardened Rules**: Access is strictly limited to document owners.
- **Validation**: All incoming data is validated for schema, type, and size.
- **PII Protection**: Personal information is restricted to owner-only reads.

---
Built with ❤️ using Google AI Studio
