# Quick Fix for Vercel Deployment Error

## Problem
Your Vercel frontend shows: **"Drug data is unavailable offline"**

**Cause**: The frontend is trying to connect to `http://localhost:3002`, which only exists on your local computer, not in production.

---

## Solution: Deploy Backend First

You **must deploy the backend** before the frontend will work on Vercel.

### Step 1: Deploy Backend on Render.com (Free)

1. Go to https://render.com and sign up

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository

4. **Configure**:
   - **Name**: `genmed-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://kkrathod477_db_user:kartik@45678rd@cluster0.qshdolq.mongodb.net/?appName=Cluster0
   DATABASE_NAME=genmed
   APP_URL=https://your-vercel-app.vercel.app
   ```

6. Click **"Create Web Service"**

7. Wait for deployment to finish (5-10 minutes)

8. **Copy your backend URL**: e.g., `https://genmed-backend.onrender.com`

---

### Step 2: Update Frontend Configuration

1. **Edit `frontend/vercel.json`**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://genmed-backend.onrender.com/api/$1"
       }
     ]
   }
   ```
   ⚠️ Replace `genmed-backend.onrender.com` with YOUR actual backend URL

2. **Commit and push to GitHub**:
   ```bash
   git add frontend/vercel.json
   git commit -m "fix: update backend URL for production"
   git push
   ```

---

### Step 3: Update Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard

2. Select your project

3. Go to **Settings** → **Environment Variables**

4. Add these variables:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://genmed-backend.onrender.com` (your backend URL)
   - **Environments**: Check all (Production, Preview, Development)

   - **Name**: `VITE_BACKEND_PORT`
   - **Value**: `443`
   - **Environments**: Check all

5. Click **"Save"**

---

### Step 4: Redeploy Frontend

1. In Vercel dashboard → **Deployments** tab

2. Click **"Redeploy"** on the latest deployment

3. OR push a new commit to trigger automatic redeployment

---

### Step 5: Update Backend CORS

1. Go back to Render.com → Your backend service

2. Go to **Environment** tab

3. Update the `APP_URL` variable:
   - **Value**: `https://your-actual-app.vercel.app` (your Vercel URL)

4. Click **"Save Changes"** → Backend will automatically redeploy

---

## Verify It Works

1. **Test backend**:
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test frontend**:
   - Open your Vercel URL in browser
   - Open DevTools → Console
   - Refresh the page
   - No more "offline" error!
   - API calls should work

---

## Why This Error Happened

- **Development**: Frontend and backend both run on your computer (`localhost:5173` and `localhost:3002`)
- **Production**: Frontend is on Vercel servers, backend needs to be deployed separately
- **Fix**: Deploy backend to Render/Railway and update frontend to point to the deployed backend URL

---

## Need Help?

If you still see errors:

1. Check browser console (F12) for error messages
2. Check Vercel deployment logs
3. Check Render backend logs
4. Verify all environment variables are correct
5. Make sure backend URL in `vercel.json` matches your actual backend URL

---

*For detailed deployment guide, see DEPLOYMENT.md*
