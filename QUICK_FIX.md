# 🔴 QUICK FIX - Render Error

## Your Error:
```
Error: Cannot find module '/opt/render/project/src/backend/build/index.js'
```

## The Problem:
Render is looking in the wrong directory because the **Root Directory** setting is incorrect.

---

## ✅ SOLUTION (2 minutes)

### Go to Render Dashboard:

1. Open your service: https://render.com/dashboard
2. Click your **genmed-backend** service
3. Click **"Settings"** in left sidebar
4. Find **"Root Directory"** field

### Change This Setting:

**Root Directory**: `backend` ⚠️ Type exactly this

### Update Build Commands:

Scroll down to find these fields and update:

**Build Command**: 
```
npm install && npm run build
```

**Start Command**: 
```
npm start
```

### Save and Redeploy:

1. Scroll to bottom → Click **"Save Changes"**
2. Click **"Manual Deploy"** tab at top
3. Click **"Deploy latest commit"**
4. Wait 3-5 minutes

---

## ✅ It Should Work Now!

Once deployed, test:
```bash
curl https://your-app.onrender.com/api/health
```

Should return: `{"status":"ok",...}`

---

## Still Getting Errors?

Read the detailed guide: `RENDER_DEPLOY.md`

---

**Why this happened:**
- Your project has `backend/` and `frontend/` folders
- Render was trying to build from project root
- Setting Root Directory to `backend` fixes this
