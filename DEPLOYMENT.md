# Deployment Guide

This guide covers deploying the frontend and backend separately for production.

---

## Prerequisites

- GitHub account (for connecting to deployment platforms)
- Backend hosting account (Render.com, Railway.app, or similar)
- Vercel account (for frontend)
- MongoDB Atlas database (you already have this)

---

## Part 1: Deploy Backend

### Option A: Deploy on Render.com (Recommended - Free tier available)

1. **Create Render account**: https://render.com

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the root directory
   - Configure build settings:
     ```
     Build Command: cd backend && npm install && npm run build
     Start Command: cd backend && npm start
     ```

3. **Add Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   APP_URL=https://your-frontend-url.vercel.app
   MONGODB_URI=mongodb+srv://kkrathod477_db_user:kartik@45678rd@cluster0.qshdolq.mongodb.net/?appName=Cluster0
   DATABASE_NAME=genmed
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Deploy**: Render will automatically build and deploy

5. **Copy your backend URL**: e.g., `https://genmed-backend.onrender.com`

### Option B: Deploy on Railway.app

1. **Create Railway account**: https://railway.app

2. **New Project** → "Deploy from GitHub repo"

3. **Settings**:
   - Root Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Variables** tab - Add same environment variables as above

5. **Generate Domain** → Copy your backend URL

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Update Vercel Configuration

Before deploying, update `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/$1"
    }
  ]
}
```

**Replace `YOUR-BACKEND-URL.onrender.com`** with your actual backend URL from Step 1.

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (easier):
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_BACKEND_URL = https://your-backend-url.onrender.com
     VITE_BACKEND_PORT = 443
     ```

4. **Deploy**: Click "Deploy"

5. **Update Backend CORS**:
   - Go back to your backend deployment (Render/Railway)
   - Update the `APP_URL` environment variable:
     ```
     APP_URL=https://your-frontend-app.vercel.app
     ```
   - Redeploy backend for CORS to allow requests from Vercel

---

## Part 3: Verify Deployment

1. **Test Backend API**:
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test Frontend**:
   - Open your Vercel URL: `https://your-app.vercel.app`
   - Open browser DevTools → Network tab
   - Navigate to Search/Compare screens
   - Verify `/api/*` requests return 200 OK

3. **Check for CORS errors**:
   - If you see CORS errors in console, make sure:
     - Backend `APP_URL` matches your Vercel frontend URL
     - Backend has been redeployed after updating `APP_URL`

---

## Quick Fix for Current Error

Your current error is because:
- Frontend on Vercel is trying to call `http://localhost:3002`
- `localhost` only works on your local machine, not in production

**Immediate fix**:

1. Deploy backend first (see Part 1)
2. Get your backend URL (e.g., `https://genmed-api.onrender.com`)
3. Update `frontend/vercel.json`:
   ```json
   "rewrites": [
     {
       "source": "/api/(.*)",
       "destination": "https://genmed-api.onrender.com/api/$1"
     }
   ]
   ```
4. In Vercel dashboard → Project Settings → Environment Variables:
   - Add: `VITE_BACKEND_URL` = `https://genmed-api.onrender.com`
5. Redeploy frontend on Vercel

---

## Troubleshooting

### Frontend shows "Drug data unavailable offline"

**Cause**: Frontend can't reach backend API

**Solutions**:
1. Verify backend is deployed and responding:
   ```bash
   curl https://your-backend-url.com/api/health
   ```
2. Check Vercel environment variables include `VITE_BACKEND_URL`
3. Check `vercel.json` rewrites point to correct backend URL
4. Check backend CORS allows your Vercel frontend domain

### CORS Errors

**Cause**: Backend doesn't allow requests from your frontend domain

**Solution**:
1. Update backend `APP_URL` environment variable to your Vercel URL
2. Redeploy backend

### 404 on API routes

**Cause**: API proxy not configured correctly

**Solution**:
1. Verify `vercel.json` has correct rewrites
2. Ensure backend routes start with `/api`
3. Redeploy frontend

---

## Environment Variables Summary

### Backend (Render/Railway)
```
NODE_ENV=production
PORT=3000
APP_URL=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=genmed
GEMINI_API_KEY=...
```

### Frontend (Vercel)
```
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_BACKEND_PORT=443
```

---

## Cost Estimates

- **MongoDB Atlas**: Free tier (512 MB storage)
- **Render.com**: Free tier (750 hours/month, spins down after inactivity)
- **Railway.app**: $5/month credit (pay for usage)
- **Vercel**: Free tier (100 GB bandwidth, unlimited projects)

**Recommended stack**: MongoDB Atlas + Render.com + Vercel = **Free**

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Enable HTTPS** (automatic on Vercel/Render)
3. **Add monitoring** (Render/Vercel have built-in logs)
4. **Configure Gemini AI API key** for AI features
5. **Set up OIDC authentication** for user login
6. **Enable web push notifications** (generate VAPID keys)

---

*Last updated: 2026-09-09*
