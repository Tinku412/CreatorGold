# 🚀 Quick Deploy Guide

The CORS error happens because Instagram's token exchange must be done server-side. Here's the fastest way to get it working:

## ⚡ Fastest Option: Render.com (5 minutes)

### Step 1: Create GitHub Repo (2 min)

```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub and push
git remote add origin https://github.com/yourusername/instagram-oauth.git
git push -u origin main
```

### Step 2: Deploy Backend on Render (2 min)

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub and select your repo
4. Configure:
   - **Name:** `instagram-oauth`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **"Create Web Service"**

Wait ~2 minutes for deployment. You'll get a URL like: `https://instagram-oauth-xxxx.onrender.com`

### Step 3: Update Frontend (1 min)

In `app.js` line 4, update:
```javascript
BACKEND_URL: 'https://your-app-name.onrender.com'  // Your Render URL
```

### Step 4: Test!

1. Open your frontend
2. Click "Connect Instagram Account"
3. Login and authorize
4. See your insights! ✨

---

## 🏃 Alternative: Run Locally (1 minute)

### Terminal 1 - Backend:
```bash
npm install
npm start
```
Backend runs on `http://localhost:3000`

### Terminal 2 - Frontend:
```bash
python -m http.server 8000
```
Frontend runs on `http://localhost:8000`

### Update app.js:
```javascript
BACKEND_URL: 'http://localhost:3000',
REDIRECT_URI: 'http://localhost:8000'
```

### Update Instagram App:
Add `http://localhost:8000/` to Valid OAuth Redirect URIs in your Instagram app settings.

---

## 📝 What Changed:

**Before (Won't Work):**
- Browser → Instagram API ❌ (CORS blocked)

**After (Works!):**
- Browser → Your Backend → Instagram API ✅

**Files Created:**
- `server.js` - Backend server
- `package.json` - Node dependencies
- `DEPLOY_BACKEND.md` - Full deployment guide with all options

**Files Modified:**
- `app.js` - Now calls backend instead of Instagram directly

---

## 🎯 Why This is Needed:

Instagram's OAuth token endpoint doesn't allow CORS for security:
- Protects your App Secret from being exposed
- Standard OAuth 2.0 security practice
- Prevents token theft

Your backend server:
- Keeps App Secret secure
- Proxies the token exchange
- Returns token to frontend
- Enables CORS for your frontend domain

---

## 🔐 Production Checklist:

- [ ] Backend deployed and running
- [ ] Frontend updated with backend URL
- [ ] Instagram app redirect URI matches frontend URL
- [ ] CORS configured correctly in server.js
- [ ] App Secret not in frontend code ✅
- [ ] Environment variables for secrets (recommended)

---

## Need Help?

See `DEPLOY_BACKEND.md` for:
- Railway deployment
- Vercel serverless functions
- Heroku deployment
- Environment variables setup
- Troubleshooting tips

The backend is super simple - just ~60 lines of code to handle token exchange securely!

