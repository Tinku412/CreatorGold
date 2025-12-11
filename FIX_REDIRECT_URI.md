# 🔧 Fix Redirect URI Mismatch Error

## The Error:
```
Error validating verification code. Please make sure your redirect_uri is identical 
to the one you used in the OAuth dialog request
```

## Why This Happens:

The `redirect_uri` must match **EXACTLY** in three places:
1. ✅ Frontend authorization request
2. ✅ Backend token exchange
3. ✅ Instagram App Settings

Even a tiny difference (trailing slash, http vs https, etc.) will cause this error.

---

## ✅ Step-by-Step Fix:

### Step 1: Check Your Current Redirect URI

**In `app.js` (line 4):**
```javascript
REDIRECT_URI: 'https://5000mrr.com'
```

**In `server.js` (line 15):**
```javascript
REDIRECT_URI: 'https://5000mrr.com'
```

**Make sure they match EXACTLY** (including trailing slash or lack thereof).

---

### Step 2: Update Instagram App Settings

1. Go to [Meta for Developers](https://developers.facebook.com/apps/)
2. Select your app (ID: 1751885948806154)
3. Go to **Instagram > Basic Display** (or Instagram API)
4. Scroll to **"Valid OAuth Redirect URIs"**
5. **Remove all existing URIs**
6. **Add exactly:** `https://5000mrr.com`
   - ⚠️ **NO trailing slash** (unless you use it everywhere)
   - ⚠️ **Must be HTTPS** (not HTTP)
   - ⚠️ **Exact match** - no extra characters
7. Click **"Save Changes"**

**Important:** Wait 1-2 minutes for changes to propagate.

---

### Step 3: Verify All Three Places Match

#### ✅ Place 1: Frontend (`app.js`)
```javascript
REDIRECT_URI: 'https://5000mrr.com'  // Must match exactly
```

#### ✅ Place 2: Backend (`server.js`)
```javascript
REDIRECT_URI: 'https://5000mrr.com'  // Must match exactly
```

#### ✅ Place 3: Instagram App Settings
- Valid OAuth Redirect URIs: `https://5000mrr.com`
- Must be in the list exactly as shown

---

### Step 4: Common Issues & Fixes

#### Issue 1: Trailing Slash Mismatch
❌ **Wrong:**
- Frontend: `https://5000mrr.com/`
- Backend: `https://5000mrr.com`
- Instagram: `https://5000mrr.com`

✅ **Fix:** Choose one format and use it everywhere:
```javascript
// Option A: No trailing slash (recommended)
REDIRECT_URI: 'https://5000mrr.com'

// Option B: With trailing slash
REDIRECT_URI: 'https://5000mrr.com/'
```

#### Issue 2: HTTP vs HTTPS
❌ **Wrong:**
- Frontend: `http://5000mrr.com`
- Backend: `https://5000mrr.com`

✅ **Fix:** Always use HTTPS:
```javascript
REDIRECT_URI: 'https://5000mrr.com'  // Always HTTPS
```

#### Issue 3: Port Number
❌ **Wrong:**
- Frontend: `https://5000mrr.com:443`
- Backend: `https://5000mrr.com`

✅ **Fix:** Don't include port for HTTPS:
```javascript
REDIRECT_URI: 'https://5000mrr.com'  // No port needed
```

#### Issue 4: Query Parameters
❌ **Wrong:**
- Frontend: `https://5000mrr.com/?ref=app`
- Backend: `https://5000mrr.com`

✅ **Fix:** No query parameters:
```javascript
REDIRECT_URI: 'https://5000mrr.com'  // Clean URL only
```

#### Issue 5: Case Sensitivity
❌ **Wrong:**
- Frontend: `https://5000MRR.com`
- Backend: `https://5000mrr.com`

✅ **Fix:** Use exact case (usually lowercase):
```javascript
REDIRECT_URI: 'https://5000mrr.com'  // Match exact case
```

---

### Step 5: Test the Fix

1. **Clear browser cache and cookies**
2. **Logout** if you're logged in
3. **Click "Connect Instagram Account"**
4. **Authorize the app**
5. **Should redirect back successfully**

---

## 🔍 Debug Checklist

Run through this checklist:

- [ ] `app.js` REDIRECT_URI matches exactly
- [ ] `server.js` REDIRECT_URI matches exactly
- [ ] Instagram App Settings has the exact URI
- [ ] No trailing slash mismatch
- [ ] Using HTTPS (not HTTP)
- [ ] No port numbers
- [ ] No query parameters
- [ ] Case matches exactly
- [ ] Waited 1-2 minutes after updating Instagram settings
- [ ] Cleared browser cache
- [ ] Tried in incognito/private window

---

## 🐛 Still Not Working?

### Check Backend Logs

On Render, check your service logs:
1. Go to Render dashboard
2. Click your service
3. Go to **"Logs"** tab
4. Look for the redirect_uri being used

You should see:
```
Token exchange request: {
  hasCode: true,
  redirectUri: 'https://5000mrr.com',
  configRedirectUri: 'https://5000mrr.com'
}
```

### Test Backend Directly

Test your backend endpoint:
```bash
curl -X POST https://creatorgold.onrender.com/exchange-token \
  -H "Content-Type: application/json" \
  -d '{"code":"test","redirect_uri":"https://5000mrr.com"}'
```

### Verify Instagram App Settings

Double-check in Instagram app:
1. **Instagram > Basic Display**
2. **Valid OAuth Redirect URIs** section
3. Should show: `https://5000mrr.com`
4. If it shows multiple, remove all others temporarily

---

## 📝 Recommended Configuration

For `https://5000mrr.com`, use this everywhere:

**app.js:**
```javascript
REDIRECT_URI: 'https://5000mrr.com'
```

**server.js:**
```javascript
REDIRECT_URI: 'https://5000mrr.com'
```

**Instagram App Settings:**
```
Valid OAuth Redirect URIs:
https://5000mrr.com
```

**That's it!** Simple and consistent. ✅

---

## 💡 Pro Tip

If you need to support multiple redirect URIs (dev + production):

**In Instagram App Settings, add both:**
```
https://5000mrr.com
http://localhost:8000
```

**In your code, use environment variables:**
```javascript
// app.js
REDIRECT_URI: window.location.origin + window.location.pathname

// server.js
REDIRECT_URI: process.env.REDIRECT_URI || 'https://5000mrr.com'
```

This way, the redirect_uri automatically matches where the app is running.

---

## ✅ Success Indicators

When it's working, you'll see:
- ✅ Redirects back to your site after Instagram authorization
- ✅ No redirect_uri error
- ✅ Token exchange succeeds
- ✅ Insights load successfully

If you see all of these, you're good! 🎉

