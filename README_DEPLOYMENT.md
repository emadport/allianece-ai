# Deployment Guide

## Vercel Deployment

### Prerequisites

1. A deployed Python FastAPI backend (Railway, Render, etc.)
2. GitHub account connected to Vercel

### Steps

1. **Push code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables in Vercel**

   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_PYTHON_API_URL=https://alliance-ai-python-backend.onrender.com
     ```

4. **Redeploy**
   - Vercel will auto-deploy after setting env variables
   - Or manually trigger a deployment

### Python Backend Deployment

Deploy your Python FastAPI server separately:

**Option 1: Railway**

1. Go to [railway.app](https://railway.app)
2. New Project → Add Service → GitHub
3. Select your repository
4. Set Python Build Command: `pip install -r requirements.txt`
5. Set Start Command: `uvicorn server:app --host 0.0.0.0`
6. Add Environment Variables:
   - Add your Python dependencies path
7. Copy the Railway URL

**Option 2: Render**

1. Go to [render.com](https://render.com)
2. New Web Service
3. Connect GitHub repository
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Copy the Render URL

### Environment Variables

**Next.js (Vercel)**

- `NEXT_PUBLIC_PYTHON_API_URL`: Your deployed Python backend URL

**Python Backend (Railway/Render)**

- None required for basic setup

### File Structure

```
.
├── app/                    # Next.js pages and API routes
├── minconda/              # Python backend (not deployed to Vercel)
├── vercel.json            # Vercel configuration
├── env.example.txt        # Environment variable template
└── README_DEPLOYMENT.md   # This file
```

### Troubleshooting

1. **CORS Errors**

   - Ensure Python backend has CORS enabled for your Vercel domain
   - Check `server.py` middleware configuration

2. **Environment Variables**

   - Variables must start with `NEXT_PUBLIC_` to be accessible in browser
   - Restart deployments after adding env variables

3. **Python Backend Not Responding**
   - Check backend logs on Railway/Render
   - Verify the backend URL in Vercel env variables
   - Test the backend health endpoint directly

### Local Development

Create `.env.local` (not committed):

```
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

### Production URLs

- **Frontend**: `https://allianece-7j5osfaha-emadi65s-projects.vercel.app`
- **Backend**: `https://alliance-ai-python-backend.onrender.com`
