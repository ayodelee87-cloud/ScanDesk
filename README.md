# 🛡️ ScanDesk

**ScanDesk** is a full-stack security scanning workspace and real-time threat detection platform designed to analyze URLs, screen content, and user inputs for potential risks such as phishing, spoofing, and unsafe patterns.

It combines a modern SaaS dashboard with a Chrome Extension to deliver fast, intelligent, and interactive security insights.

---

## 🚀 Features

### 🔍 Real-Time Scanning

* Scan URLs, text, or active browser tabs
* Detect suspicious patterns and phishing indicators
* Risk scoring system (Safe, Suspicious, Dangerous)

### 🧠 AI-Powered Analysis

* Heuristic-based threat detection (SSL, keywords, domain patterns)
* Integrated AI analysis via Gemini API (fallback supported)

### 🧾 Scan History

* Persistent scan logs per user
* Search and filter past scans
* Real-time updates on dashboard

### 🔐 Authentication System

* JWT-based authentication
* Secure signup and login
* Protected API routes

### 🧩 Chrome Extension (Manifest v3)

* Scan current tab instantly
* Popup UI integrated with backend
* Actions:

  * Scan Tab
  * Capture Screen (mock)
  * Lasso Area (mock)

---

## 🏗️ Tech Stack

### Frontend

* Next.js / React
* TypeScript
* Tailwind CSS
* Zustand / Context API

### Backend

* Node.js + Express
* REST API architecture
* JWT Authentication

### Database

* JSON (local development)
* Prisma ORM (PostgreSQL / SQLite ready)

### Extension

* Chrome Extension (Manifest v3)

---

## 📁 Project Structure

```
/assets
/extension
  ├── manifest.json
  ├── popup.html
  ├── popup.js

/prisma
  └── schema.prisma

/src
  ├── components
  ├── server
  │    ├── auth.ts
  │    ├── db.ts
  │    ├── scanner.ts
  ├── App.tsx
  ├── main.tsx

/data
  └── scandesk_db.json

.env.example
package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file and configure:

```
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
JWT_SECRET=your_secure_secret_key
```

---

## 🧪 How It Works

### 1. Scan Engine

* Accepts input (URL/text)
* Runs heuristic checks:

  * HTTP vs HTTPS
  * Suspicious keywords (login, verify, bank)
* Sends data to AI model (optional)
* Returns:

  * risk_score (0–100)
  * status
  * explanation

---

### 2. API Endpoint

**POST /api/scan**

Request:

```
{
  "input": "https://example.com"
}
```

Response:

```
{
  "risk_score": 72,
  "status": "suspicious",
  "details": "Contains login keyword and no HTTPS"
}
```

---

## 🖥️ Running Locally

### 1. Install Dependencies

```
npm install
```

### 2. Set Environment Variables

Create `.env` file using `.env.example`

### 3. Run the App

```
npm run dev
```

---

## 🔌 Chrome Extension Setup

1. Open Chrome and go to:

   ```
   chrome://extensions
   ```

2. Enable **Developer Mode**

3. Click **Load unpacked**

4. Select the `/extension` folder

5. Use the extension popup to scan tabs

---

## 🎨 Design System

* Dark theme (Midnight Indigo)
* Tailwind CSS custom tokens
* Fonts:

  * Geist (UI)
  * JetBrains Mono (data/telemetry)

---

## 🔐 Security Considerations

* Input validation
* JWT token protection
* Basic rate limiting
* Safe fallback when AI fails

---

## 🚀 Future Improvements

* Real-time screen capture scanning
* Multi-user team dashboard
* WebSocket live updates
* Advanced AI threat classification
* Deployment (Vercel + Cloud backend)

---

## 📌 Status

✅ Functional full-stack prototype
🚧 Ready for production optimization and deployment

---

## 👨‍💻 Author

Built as a modern security SaaS prototype integrating AI, browser extensions, and real-time scanning systems.

---

## ⭐ License

MIT License
