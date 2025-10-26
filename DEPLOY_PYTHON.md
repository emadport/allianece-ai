# Deploying Python Backend (FastAPI + UNet)

## Option 1: Railway (Recommended - Easiest)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Create a NEW repo with just the Python backend:
   ```bash
   # In a NEW folder
   mkdir allianceai-backend
   cd allianceai-backend
   cp ../minconda/miniconda3/envs/haircut-line/*.py .
   cp ../minconda/miniconda3/envs/haircut-line/requirements.txt .
   git init
   git add .
   git commit -m "Python backend"
   git push to NEW repo
   ```
5. Connect Railway to that repo
6. Railway auto-detects Python
7. Copy the Railway URL (e.g., https://your-app.railway.app)
8. Add to Vercel env: NEXT_PUBLIC_PYTHON_API_URL

## Option 2: Render
1. Go to https://render.com
2. Create "Web Service"
3. Connect GitHub repo
4. Build command: pip install -r requirements.txt
5. Start command: uvicorn server:app --host 0.0.0.0 --port $PORT

## Quick Setup Script
Run this to prepare the backend for deployment:
