# 🚀 Deployment Checklist

## ✅ Step-by-Step Guide to Deploy Your App

### 1. Push Code to GitHub ⬆️

```bash
cd d:\project\Genmed2026-generic1
git push origin main
```

---

### 2. Deploy Backend on Render 🔧

**Go to:** https://render.com/dashboard

**Settings:**
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Environment Variables:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://kkrathod477_db_user:kartik@45678rd@cluster0.qshdolq.mongodb.net/?appName=Cluster0
DATABASE_NAME=genmed
APP_URL=https://your-vercel-app.vercel.app
```

**Deploy & Copy URL:** e.g., `https://genmed-backend.onrender.com`

---

### 3. Update Frontend Configuration 📝

**Edit `frontend/vercel.json`:**

Replace `YOUR-BACKEND-URL` with your actual Render URL:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/$1"
    }
  ]
}
```

**Commit and push:**
```bash
git add frontend/vercel.json
git commit -m "fix: update backend URL for production"
git push
```

---

### 4. Configure Vercel Frontend 🎨

**Go to:** https://vercel.com/dashboard

**Project Settings → Environment Variables:**

Add:
- `VITE_BACKEND_URL` = `https://your-backend.onrender.com`
- `VITE_BACKEND_PORT` = `443`

**Redeploy:** Vercel will auto-deploy after you push, or manually trigger

---

### 5. Update Backend CORS 🔄

**Go back to Render:**
- Settings → Environment Variables
- Update `APP_URL` to your actual Vercel frontend URL
- Save (backend will auto-redeploy)

---

### 6. Test Everything ✅

**Test Backend:**
```bash
curl https://your-backend.onrender.com/api/health
```

Expected: `{"status":"ok",...}`

**Test Frontend:**
- Open: https://your-app.vercel.app
- Check browser console (F12)
- Should load drug data without errors

---

## 🎯 Quick Reference

| Service | Platform | URL Format |
|---------|----------|------------|
| Backend API | Render.com | `https://your-app.onrender.com` |
| Frontend | Vercel | `https://your-app.vercel.app` |
| Database | MongoDB Atlas | Already configured |

---

## ⚠️ Common Issues

### "Cannot find module" on Render
- Root Directory must be `backend`
- Start Command must be `npm start`

### "Drug data unavailable" on Vercel
- Check VITE_BACKEND_URL environment variable
- Check vercel.json rewrites
- Check backend is deployed and responding

### CORS errors
- Update backend APP_URL to match Vercel URL
- Redeploy backend

---

*Read RENDER_FIX_FINAL.md for detailed troubleshooting*
