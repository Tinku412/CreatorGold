# Server-Side OAuth Flow

Everything is now handled server-side! This is more secure and eliminates redirect_uri mismatch issues.

## 🔄 New Flow:

1. **User clicks "Connect Instagram"** → Frontend redirects to Instagram OAuth
2. **User authorizes** → Instagram redirects to **backend** (`/oauth/callback`)
3. **Backend exchanges code for token** → Backend handles token exchange
4. **Backend redirects to frontend** → With token in URL (or error)
5. **Frontend extracts token** → Stores in localStorage and shows insights

## ✅ Benefits:

- ✅ **No redirect_uri mismatch** - Backend handles everything
- ✅ **More secure** - Token exchange happens server-side
- ✅ **Simpler** - No complex frontend/backend coordination
- ✅ **Standard OAuth pattern** - Industry best practice

## 📋 Configuration:

### Backend (`server.js`):
- **Redirect URI**: `https://creatorgold.onrender.com/oauth/callback`
- **Frontend URL**: `https://5000mrr.com` (where to redirect after login)

### Frontend (`app.js`):
- **Backend URL**: `https://creatorgold.onrender.com`
- **Frontend URL**: `https://5000mrr.com`

## 🔧 Instagram App Settings Update:

**CRITICAL:** You must update your Instagram app settings:

1. Go to [Meta for Developers](https://developers.facebook.com/apps/)
2. Select your app (ID: 1751885948806154)
3. Go to **Instagram → Basic Display**
4. Find **"Valid OAuth Redirect URIs"**
5. **Remove**: `https://5000mrr.com`
6. **Add**: `https://creatorgold.onrender.com/oauth/callback`
7. Click **"Save Changes"**
8. **Wait 2-3 minutes** for changes to propagate

## 🚀 Deployment:

1. **Redeploy backend:**
   ```bash
   git add server.js app.js
   git commit -m "Refactor to server-side OAuth flow"
   git push
   ```

2. **Wait for Render to deploy** (~2 minutes)

3. **Test the flow:**
   - Go to `https://5000mrr.com`
   - Click "Connect Instagram Account"
   - Should redirect to Instagram
   - After authorization, should redirect back to frontend with token
   - Insights should load automatically

## 🔍 How It Works:

### Step 1: User Initiates Login
```
Frontend → Instagram OAuth
Redirect URI: https://creatorgold.onrender.com/oauth/callback
```

### Step 2: Instagram Redirects to Backend
```
Instagram → Backend /oauth/callback?code=...
Backend receives code
```

### Step 3: Backend Exchanges Token
```
Backend → Instagram API
Exchanges code for access_token
```

### Step 4: Backend Redirects to Frontend
```
Backend → Frontend
URL: https://5000mrr.com?token=...&user_id=...
```

### Step 5: Frontend Handles Token
```
Frontend extracts token from URL
Stores in localStorage
Shows insights
```

## 🐛 Troubleshooting:

### "Redirect URI mismatch"
- **Check:** Instagram app settings has `https://creatorgold.onrender.com/oauth/callback`
- **Verify:** No trailing slash, exact match

### "Token not received"
- **Check:** Backend logs show successful token exchange
- **Check:** Frontend URL in backend config matches your domain

### "Backend not responding"
- **Check:** Render service is running
- **Check:** `/oauth/callback` endpoint is accessible

## 📝 Environment Variables (Optional):

You can set these in Render dashboard → Environment:

```
BACKEND_URL=https://creatorgold.onrender.com
FRONTEND_URL=https://5000mrr.com
```

If not set, defaults are used from code.

## ✅ Success Indicators:

- ✅ Backend logs show: "OAuth callback received"
- ✅ Backend logs show: "Token exchange successful"
- ✅ Frontend receives token in URL
- ✅ Insights load automatically

---

**That's it!** Everything is now server-side. Much simpler and more secure! 🎉

