# Deploy Backend to Render.com - Step by Step

## Error Fix: "Cannot find module '/opt/render/project/src/backend/build/index.js'"

This error happens because Render is looking in the wrong directory. Here's the correct setup:

---

## Step 1: Configure Render Service

### If Starting Fresh:

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure with these **EXACT** settings:

**Basic Settings:**
- **Name**: `genmed-backend` (or your preferred name)
- **Region**: Choose closest to you (e.g., Oregon)
- **Branch**: `main` (or your main branch)
- **Root Directory**: `backend` ⚠️ IMPORTANT
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

**Instance Type:**
- Free tier is fine for testing

---

## Step 2: Add Environment Variables

In the Render dashboard, scroll down to **"Environment Variables"** section and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://kkrathod477_db_user:kartik@45678rd@cluster0.qshdolq.mongodb.net/?appName=Cluster0
DATABASE_NAME=genmed
APP_URL=https://your-app.vercel.app
```

⚠️ **Important**: 
- `PORT` must be `10000` (Render's default)
- Replace `APP_URL` with your actual Vercel frontend URL

---

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait 3-5 minutes for first deployment
4. You'll get a URL like: `https://genmed-backend.onrender.com`

---

## Step 4: Verify Deployment

Once deployed, test the API:

```bash
curl https://your-app.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

---

## If You Already Created the Service:

### Fix the Configuration:

1. Go to your Render service dashboard
2. Click **"Settings"** in the left sidebar
3. Update these fields:

**Root Directory**: Change to `backend`

**Build Command**: Change to:
```
npm install && npm run build
```

**Start Command**: Change to:
```
npm start
```

4. Scroll down and click **"Save Changes"**
5. Go to **"Manual Deploy"** → **"Deploy latest commit"**

---

## Troubleshooting

### Error: "Cannot find module"

**Cause**: Wrong Root Directory or incorrect Start Command

**Fix**:
1. Set Root Directory to `backend`
2. Set Start Command to `npm start` (not `node build/index.js`)
3. Redeploy

### Build Fails

**Cause**: Missing dependencies or TypeScript errors

**Fix**:
1. Check build logs in Render dashboard
2. Make sure `backend/tsconfig.json` exists
3. Make sure all imports are correct

### Port Issues

**Cause**: Backend not listening on Render's PORT

**Fix**:
- Render automatically sets `PORT=10000`
- Your code should use `process.env.PORT` (already done in `backend/src/index.ts`)

---

## Alternative: Use render.yaml (Blueprint)

If manual setup keeps failing, use the `render.yaml` file:

1. Make sure `render.yaml` is at project root
2. In Render dashboard: **"New +"** → **"Blueprint"**
3. Connect repository
4. Render will auto-detect `render.yaml` and configure everything

---

## Next Steps After Successful Deployment

1. Copy your backend URL: `https://your-app.onrender.com`

2. Update `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://your-app.onrender.com/api/$1"
       }
     ]
   }
   ```

3. Update Vercel environment variables:
   - `VITE_BACKEND_URL` = `https://your-app.onrender.com`

4. Redeploy frontend on Vercel

5. Update backend `APP_URL` environment variable in Render:
   - Set to your Vercel frontend URL

---

## Cost & Performance

- **Free Tier**: 750 hours/month
- **Sleep Mode**: Free tier spins down after 15 minutes of inactivity
- **Wake Up**: First request after sleep takes 30-60 seconds
- **Paid Tier**: $7/month for always-on service

---

*For frontend deployment, see VERCEL_FIX.md*
