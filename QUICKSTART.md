# Quick Start Guide

## Setup Instagram App First

Before running, you need to set up your Instagram app. See `SETUP_INSTAGRAM_APP.md` for detailed instructions, or quick version:

1. Create app at https://developers.facebook.com/apps/
2. Add Instagram product
3. Configure OAuth redirect URI
4. Get App ID and App Secret
5. Update `app.js` with your credentials

## Run the App (30 seconds)

### Option 1: Double-click (Simplest)
Just double-click `index.html` and it will open in your browser.

### Option 2: Local Server (Recommended)
```bash
python -m http.server 8000
```
Then open: http://localhost:8000

## How It Works

1. Click **"Connect Instagram Account"** button
2. Login with your Instagram Business account
3. Authorize the app
4. View your metrics automatically!
5. Use **"Logout"** button when done

## What You'll See

- ✅ Profile picture, name, username
- ✅ Followers, Following, Posts count
- ✅ Total Reach (last 30 days)
- ✅ Total Impressions (last 30 days)
- ✅ Profile Views, Website Clicks, and more

## Files

- `index.html` - The main page (UI)
- `app.js` - The JavaScript code (API calls)
- `README.md` - Full documentation

## Universal Login

Works for **any Instagram Business account** - no hardcoded tokens! Users login with their own credentials via Instagram OAuth.

## Troubleshooting

**Problem:** "Redirect URI Mismatch"
- **Solution:** Add your URL to Valid OAuth Redirect URIs in Instagram app settings

**Problem:** "Can't login with my account"
- **Solution:** Add yourself as a test user in the app dashboard, or submit for app review

**Problem:** "Session expired"
- **Solution:** Just logout and login again to get a fresh token

**Problem:** "Insights not available"
- **Solution:** Ensure your Instagram account is a **Business** account (not Personal or Creator)

## Notes

- ⏰ Insights data is from the last 30 days
- 🔄 Access tokens expire every 60-90 days
- 📊 Some metrics may show 0 if not applicable

That's it! Simple and straightforward.

