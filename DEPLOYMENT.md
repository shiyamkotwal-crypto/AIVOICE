# 🚀 VoiceBridge AI — Production Deployment Guide

This guide provides end-to-end instructions for building, testing, and deploying the **VoiceBridge AI** full-stack application (React 18 + Vite frontend, Express Node.js backend, Google Gemini 3.8 Flash NLU, and Supabase Cloud PostgreSQL).

---

## 📋 Environment Variables Checklist

Before deploying, ensure you have the following environment variables configured:

| Variable | Description | Where to Get |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `SUPABASE_URL` | Supabase Project URL | [Supabase Dashboard](https://supabase.com/dashboard) ➔ Project Settings ➔ API |
| `SUPABASE_ANON_KEY` | Supabase Public Anonymous Key | Supabase Dashboard ➔ API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Admin) | Supabase Dashboard ➔ API |
| `JWT_SECRET` | Strong secret key for signing auth tokens | Any secure 32+ character random string |
| `PORT` | Backend port (default `5000` or assigned by cloud host) | Host assigned (e.g. `10000` on Render) |
| `NODE_ENV` | Environment mode (`production` or `development`) | Set to `production` |

---

## 🖥️ Option 1: Local Production Run (Unified Single Port)

VoiceBridge AI is configured to serve the compiled React Vite frontend directly from the Node.js Express server on port `5000`.

### Using Windows Helper Scripts:
1. Double-click **`build.bat`** (or run `npm.cmd --prefix client run build`).
2. Double-click **`start.bat`** (or run `node server/src/index.js`).
3. Open your browser at **`http://localhost:5000/`**. Both the frontend and `/api` endpoints run on port 5000!

### Using Terminal (Cross-Platform):
```bash
# 1. Build the frontend client bundle into client/dist
npm --prefix client run build

# 2. Start the unified production server
NODE_ENV=production node server/src/index.js
```

---

## ☁️ Option 2: 1-Click Free Cloud Deployment on Render.com (Recommended)

Render offers free Node.js hosting with automated GitHub deployments.

### Steps:
1. Push your project code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: VoiceBridge AI production release"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/voicebridge-ai.git
   git push -u origin main
   ```
2. Log in to [Render.com](https://render.com) and click **"New +" ➔ "Web Service"**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Name:** `voicebridge-ai`
   - **Environment:** `Node`
   - **Region:** Any (e.g., `Oregon (US West)`)
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm --prefix server install && npm --prefix client install && npm --prefix client run build
     ```
   - **Start Command:**
     ```bash
     node server/src/index.js
     ```
5. In **"Environment Variables"**, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Your Google AI Studio key)*
   - `SUPABASE_URL`: *(Your Supabase project URL)*
   - `SUPABASE_ANON_KEY`: *(Your Supabase anon key)*
   - `SUPABASE_SERVICE_ROLE_KEY`: *(Your Supabase service role key)*
   - `JWT_SECRET`: *(A secure random string)*
6. Click **"Create Web Service"**.
7. Render will build the Vite app, start the Express server, and give you a live URL:
   `https://voicebridge-ai.onrender.com`

---

## 🐳 Option 3: Docker Container Deployment (Railway / Fly.io / VPS / AWS)

VoiceBridge AI includes a production-ready, multi-stage `Dockerfile`.

### Build & Run Locally with Docker Compose:
```bash
# Build and run container in detached mode
docker compose up --build -d

# View logs
docker compose logs -f

# Stop container
docker compose down
```

### Deploying to Railway.app:
1. Go to [Railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub Repo**.
3. Railway automatically detects the `Dockerfile` and builds the production image.
4. Add the environment variables (`GEMINI_API_KEY`, `SUPABASE_URL`, etc.) under the **Variables** tab.
5. Generate a public domain under **Settings ➔ Networking**.

---

## ⚡ Option 4: Split Cloud Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on Vercel's global Edge CDN:

### A. Deploy Backend on Render:
1. Follow Option 2 above to deploy only the backend service on Render.
2. Note your backend URL (e.g., `https://voicebridge-backend.onrender.com`).

### B. Deploy Frontend on Vercel:
1. In `client/.env.production` (or Vercel project environment variables), add:
   ```env
   VITE_API_URL=https://voicebridge-backend.onrender.com
   ```
2. Import the project repository into [Vercel](https://vercel.com).
3. Set the **Root Directory** to `client`.
4. Deploy!

---

## 🗄️ Database Verification on Supabase Cloud

Ensure the initial SQL migrations are applied in your Supabase project:
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Click **RUN**.
4. Check **Table Editor** to confirm:
   - `public.profiles`
   - `public.conversations`
   - `public.messages`

---

## 🔍 Post-Deployment Health Check

After deployment, test the backend relay health endpoint:
```bash
curl https://your-deployment-url.com/api/health
```
Expected response:
```json
{
  "status": "online",
  "platform": "VoiceBridge AI",
  "version": "1.0.0",
  "gemini_configured": true,
  "supabase_configured": true
}
```
