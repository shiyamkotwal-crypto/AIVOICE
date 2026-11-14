# 🎙️ VoiceBridge AI — Multilingual Voice & Conversational Intelligence Platform

[![Theme: Voice & Conversational Intelligence](https://img.shields.io/badge/Theme-Voice%20%26%20Conversational%20Intelligence-emerald?style=for-the-badge)](https://github.com)
[![AI: Google Gemini 3.8](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-blue?style=for-the-badge)](https://ai.google.dev)
[![Database: Supabase PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-teal?style=for-the-badge)](https://supabase.com)
[![Frontend: React + Vite + Tailwind](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-purple?style=for-the-badge)](https://vitejs.dev)

VoiceBridge AI is a production-grade, real-time, multilingual conversational intelligence platform engineered to eliminate rigid IVR phone trees and slow manual support desks. Powered by browser-native Speech-to-Text (STT), Google Gemini AI, and browser Text-to-Speech (TTS), it empowers students, faculty, and administrative staff to interact fluently in **English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Spanish (Español), Tamil (தமிழ்), Telugu (తెలుగు), French, German, and Bengali**.

---

## 🌟 Architecture & Data Flow

```mermaid
flowchart LR
    A["👤 User Voice / Microphone"] -->|"Web Speech API (STT)"| B["🌐 React Frontend (Vite)"]
    B -->|"REST API + JWT Bearer"| C["⚡ Express Backend Relay"]
    C -->|"Zod Schema Validation"| D["🛡️ Middleware Layer"]
    D -->|"@google/genai (gemini-3.8-flash)"| E["🤖 Google Gemini AI"]
    D -->|"PostgreSQL / RLS"| F["🐘 Supabase Cloud PostgreSQL"]
    E -->|"Multilingual Response"| C
    C -->|"JSON Payload"| B
    B -->|"SpeechSynthesis (TTS)"| G["🔊 Spoken Voice Audio Output"]
```

---

## 🗄️ Supabase Cloud PostgreSQL Migration & Database Setup

The project includes a complete migration script and automatic migration runner:

### 1. Migration File: `/supabase/migrations/001_initial_schema.sql`
Contains:
* **Extensions:** `uuid-ossp` and `pgcrypto`.
* **Tables:** `public.profiles`, `public.conversations`, `public.messages`.
* **Indexes:** Performance indexes on emails, user foreign keys, and chronological timestamps.
* **Row Level Security (RLS):** Production policies for all CRUD operations, supporting authenticated users (`auth.uid()`) and the `service_role` key.
* **Auth Triggers:** `public.handle_new_user()` trigger for `auth.users` to automatically populate profiles upon Supabase Auth sign-ups.
* **Seed Data:**
  - Demo Student Profile (`student.demo@voicebridge.ai`)
  - Demo Admin Profile (`admin.demo@voicebridge.ai`)
  - Demo Faculty Profile (`faculty.demo@voicebridge.ai`)
  - 4 Pre-seeded Conversations across all 4 Campus Domains (Academic, Technical, Facilities, Administrative) in English, Hindi, Kannada, and Spanish.
  - 8 Pre-seeded Multimodal Messages with transcripts, `is_voice: true`, and `audio_played: true`.

### 2. Applying Migrations Directly to Supabase Cloud

You can run the migration runner with:
```bash
npm run db:migrate
```

The runner supports:
1. **Direct Connection:** When `DATABASE_URL` (or `SUPABASE_DB_URL`) is supplied in `server/.env`, it executes the full transaction via `pg` (node-postgres) with SSL.
2. **Service Role Key:** When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided, it verifies connection and seeds profile data via the Supabase Admin API.
3. **1-Click SQL Editor:** You can also copy the contents of `/supabase/migrations/001_initial_schema.sql` directly into your **Supabase Dashboard SQL Editor** and click **Run**.
4. **Local Fallback:** If offline or credentials are not yet supplied, it seeds the local persistent engine (`server/data/voicebridge.json`) mirroring the exact Supabase schema.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 1. Installation
Clone or navigate to the project directory and install all root, server, and client dependencies:
```bash
npm run install:all
```

### 2. Configuration
Copy the `.env.example` in `server/` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Configure your environment variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=voicebridge-ai-super-secret-jwt-key-development-2026

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Cloud Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Supabase Direct PostgreSQL Connection (Optional, for automated CLI migrations)
DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 3. Run Migrations
```bash
npm run db:migrate
```

### 4. Running the Application
Start both the Express backend and React frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## ⚡ 1-Click Evaluator Accounts

For hackathon review, 1-click test buttons are provided directly on the Login page:
- **Demo Student:** `student.demo@voicebridge.ai` (Pre-loaded with sample queries)
- **Demo Admin:** `admin.demo@voicebridge.ai` (Campus administrator view)

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health and service diagnostics status | No |
| `POST` | `/api/auth/signup` | Register new user profile with bcrypt hash | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT Bearer token | No |
| `POST` | `/api/auth/demo` | 1-Click demo authentication for evaluators | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes |
| `POST` | `/api/chat` | Send multimodal query (text/voice) & receive AI response | Yes |
| `GET` | `/api/conversations` | List user conversation threads | Yes |
| `GET` | `/api/conversations/:id` | Fetch full chronological message logs for thread | Yes |
| `DELETE` | `/api/conversations/:id` | Cascade delete conversation and messages | Yes |
| `PATCH` | `/api/messages/:id/audio-played` | Update message `audio_played: true` | Yes |
| `GET` | `/api/analytics` | Fetch engagement and voice utilization metrics | Yes |
| `GET` | `/api/domains` | Curated campus domain directory & sample questions | No |

---

## 🌐 Supported Spoken Languages

- 🇺🇸 English (`en-US` / `en-IN`)
- 🇮🇳 Hindi / हिन्दी (`hi-IN`)
- 🇮🇳 Kannada / ಕನ್ನಡ (`kn-IN`)
- 🇪🇸 Spanish / Español (`es-ES`)
- 🇮🇳 Tamil / தமிழ் (`ta-IN`)
- 🇮🇳 Telugu / తెలుగు (`te-IN`)
- 🇫🇷 French / Français (`fr-FR`)
- 🇩🇪 German / Deutsch (`de-DE`)
- 🇮🇳 Bengali / বাংলা (`bn-IN`)
- 🇮🇳 Marathi / मराठी (`mr-IN`)
