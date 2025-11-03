# How to Start All Servers

## Quick Start

### Option 1: Using the Start Script (Recommended)

Run both servers with a single command:

```bash
./start.sh
```

### Option 2: Using npm

```bash
npm run dev:all
```

This will start:

- Frontend (Next.js) on http://localhost:3000
- Backend (Python FastAPI) on http://localhost:8000

## Manual Start (Alternative)

If you need to run servers separately:

### Terminal 1 - Frontend

```bash
npm run dev
```

### Terminal 2 - Backend

```bash
npm run python:dev
```

## Prerequisites

### Node.js Version

Make sure you're using Node.js 20:

```bash
nvm use 20
node -v  # Should show v20.x.x
```

### Python Requirements

Install Python dependencies:

```bash
npm run python:install
```

### SAM Checkpoint (First Time Only)

Download the SAM model checkpoint:

```bash
cd backend-deploy
curl -L https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth -o sam_vit_h.pth
```

## Stopping Servers

Press `Ctrl+C` in the terminal running `npm run dev:all`

Or kill all processes:

```bash
pkill -f "next dev"
pkill -f "uvicorn server:app"
```

## Troubleshooting

### Port Already in Use

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Wrong Node Version

```bash
nvm use 20
```

### Python Server Won't Start

Check if uvicorn is installed:

```bash
cd backend-deploy
pip install -r requirements.txt
```
