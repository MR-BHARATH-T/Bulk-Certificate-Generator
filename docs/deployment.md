# Deployment Guide

This guide covers deploying the Bulk Certificate Generator on a free-tier stack using Render, Vercel, and Supabase.

## 1. Database and Storage (Supabase)

1. Create a new Supabase project.
2. Under **Project Settings -> Database**, copy the Transaction Pooler Connection String (URI format) and replace the password. This is your `DATABASE_URL`.
3. Under **Project Settings -> API**, copy the `Project URL` (`SUPABASE_URL`) and the `service_role` secret (`SUPABASE_SERVICE_ROLE_KEY`).
4. Go to **Storage**, create a new bucket named `certificates`. Keep it **Private** (do NOT check "Public Bucket").

## 2. Backend API & Worker (Render)

Render allows you to deploy web services (API) and background workers, though the free tier spins down after inactivity.

1. Create a new **Web Service** on Render connected to your GitHub repository.
2. Build Command: `pip install -r backend/requirements.txt`
3. Start Command: `cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `DATABASE_URL` (From Supabase)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STORAGE_BUCKET` = `certificates`
   
**Free Tier Considerations**:
Render's free tier sleeps after 15 minutes of inactivity. When it wakes up, the first request will take 30-60 seconds.

### Deploying the Worker
Render requires a separate "Background Worker" service for processing if you want it decoupled. However, free tier only allows 1 Web Service.
*Alternative for Free Tier*: You can run the worker loop in the background of your FastAPI app using `asyncio.create_task()` in the `lifespan` event, but it's less robust. For true decoupled architecture, consider a separate Background Worker (paid tier) or migrating to Celery + Redis when scaling.

## 3. Frontend (Vercel)

1. Create a new project on Vercel connected to your GitHub repo.
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Environment Variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api/v1`
6. Deploy.

## Security & Limitations
- **No Auth Implemented**: Currently, anyone who knows a certificate ID can download it, and anyone can create a job. For production, add JWT authentication on the API layer.
- **CORS**: Ensure `allow_origins` in `main.py` is updated from `["*"]` to your Vercel domain in production.
- **Free Tier Storage Limits**: Supabase free tier has a 1GB storage limit. Clean up old certificates via a cron job if volume is high.
