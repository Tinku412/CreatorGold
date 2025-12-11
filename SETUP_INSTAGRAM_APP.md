# Instagram App Setup Guide

Complete guide to set up your Instagram app for OAuth login.

## Step 1: Create Meta App (5 minutes)

1. Go to https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Choose your use case:
   - Select **"Other"**
   - Click **"Next"**
4. Choose app type:
   - Select **"Business"**
   - Click **"Next"**
5. Fill in details:
   - **App name:** Your app name (e.g., "Instagram Insights Viewer")
   - **App contact email:** Your email
   - Click **"Create app"**

## Step 2: Add Instagram Product (2 minutes)

1. In the left sidebar, click **"Add products"**
2. Find **"Instagram"** card
3. Click **"Set up"**
4. You'll see Instagram added to your products

## Step 3: Configure Instagram Basic Display (3 minutes)

1. Go to **Instagram > Basic Display** in left sidebar
2. Scroll down to **"User Token Generator"** section
3. Click **"Create New App"**
4. Fill in:
   - **Display Name:** Your App Name
   - **Valid OAuth Redirect URIs:**
     ```
     http://localhost:8000/
     http://localhost:8080/
     https://yourdomain.com/
     ```
   - **Deauthorize Callback URL:** (optional)
   - **Data Deletion Request URL:** (optional)
5. Click **"Save Changes"**

## Step 4: Get App Credentials (1 minute)

1. Go to **Settings > Basic** in left sidebar
2. You'll see:
   - **App ID** (e.g., 1234567890)
   - **App Secret** (click "Show" to reveal)
3. Copy both values

## Step 5: Update Your Code (1 minute)

Open `app.js` and update:

```javascript
const CONFIG = {
    APP_ID: '1751885948806154',  // Replace with your App ID
    APP_SECRET: '6f39e0ffd4ffccbd731142cf3b1bb9dd',  // Replace with your App Secret
    REDIRECT_URI: window.location.origin + window.location.pathname,
    // ... rest stays the same
};
```

## Step 6: Add Test Users (For Testing - 2 minutes)

Before app review approval, you can only login with test users:

1. Go to **App Roles > Roles**
2. Click **"Add Instagram Testers"**
3. Search for Instagram usernames
4. Add them as testers
5. The Instagram user must accept the invite:
   - Go to their Instagram app
   - Settings > Apps and Websites
   - Tester Invites
   - Accept

## Step 7: Test Your App (1 minute)

1. Run your app: `python -m http.server 8000`
2. Open: `http://localhost:8000`
3. Click **"Connect Instagram Account"**
4. Login with test user account
5. Authorize the app
6. View your insights!

## Step 8: Submit for App Review (For Public Use)

To allow ANY Instagram user to login (not just testers):

1. Go to **App Review > Permissions and Features**
2. Request these permissions:
   - `instagram_business_basic`
   - `instagram_business_manage_insights`
3. For each permission:
   - Click **"Request"**
   - Fill in the form:
     - **How will you use this permission?**
       "To allow Instagram Business account owners to view their account insights including reach, engagement, and profile analytics."
   - Add screencast/screenshots
   - Submit
4. Wait for approval (typically 1-2 weeks)

## App Modes

### Development Mode (Default)
- Only admins, developers, and testers can login
- No app review needed
- Perfect for testing

### Live Mode (After Approval)
- Any Instagram user can login
- Requires app review approval
- For production use

## Common Issues

### "URL Blocked: This redirect failed"
- **Fix:** Add your URL to Valid OAuth Redirect URIs in Instagram Basic Display settings
- Make sure the URL matches exactly (including trailing slash)

### "Invalid Client ID"
- **Fix:** Double-check your App ID in the code matches the one in Settings > Basic

### "Can't login with my account"
- **Fix:** Either add yourself as a test user, or submit app for review

### "Session expired"
- **Fix:** Instagram tokens expire. Just login again when prompted

## Permissions Explained

### instagram_business_basic
- Access to basic profile info (username, profile picture)
- Required for all Instagram API calls

### instagram_business_manage_insights
- Access to insights data (reach, impressions, engagement)
- Required to fetch analytics

## Testing Checklist

- [ ] App created successfully
- [ ] Instagram product added
- [ ] OAuth redirect URI configured
- [ ] App ID and Secret updated in code
- [ ] Test user added and accepted invite
- [ ] Can login with test account
- [ ] Insights display correctly
- [ ] Logout works

## Production Checklist

- [ ] App submitted for review
- [ ] Permissions approved
- [ ] App switched to Live mode
- [ ] Testing with real users
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] HTTPS enabled
- [ ] Backend server for token exchange (recommended)

## Need Help?

- [Instagram Platform Documentation](https://developers.facebook.com/docs/instagram-platform)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Meta for Developers Community](https://developers.facebook.com/community/)

---

That's it! You're ready to use Instagram OAuth in your app. 🎉

