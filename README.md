# Instagram Insights Viewer

A simple single-page application to view Instagram Business account insights for **any user**.

## Features

- ✅ **Universal Login** - Works for any Instagram Business account
- ✅ **Instagram OAuth** - Secure login with Instagram
- ✅ **One-click insights** - Connect and view metrics instantly
- ✅ **Profile information** - Display user profile data
- ✅ **Key metrics** - Reach, engagement, profile views, and more
- ✅ **Clean, modern UI** - Beautiful gradient design
- ✅ **No database required** - Uses localStorage for session management
- ✅ **Auto-logout on expiry** - Handles expired tokens gracefully

## Setup

### 1. Create Instagram App

1. Go to [Meta for Developers](https://developers.facebook.com/apps/)
2. Click **"Create App"**
3. Choose **"Other"** as use case
4. Choose **"Business"** as app type
5. Fill in app details and create

### 2. Configure Instagram Login

1. In your app dashboard, go to **"Add Products"**
2. Find **"Instagram"** and click **"Set Up"**
3. Go to **Instagram > Basic Display** (or Instagram API)
4. Add **Valid OAuth Redirect URIs**:
   - For local testing: `http://localhost:8000/`
   - For production: `https://yourdomain.com/`
5. Click **"Save Changes"**

### 3. Get Your Credentials

1. Go to **Settings > Basic**
2. Copy your **App ID** and **App Secret**
3. Open `app.js` and update the config:

```javascript
const CONFIG = {
    APP_ID: 'YOUR_APP_ID_HERE',
    APP_SECRET: 'YOUR_APP_SECRET_HERE', // Keep this secure in production!
    REDIRECT_URI: window.location.origin + window.location.pathname,
    // ... rest stays the same
};
```

### 4. App Review (For Production)

For production use with public users:
1. Submit your app for **App Review**
2. Request permissions:
   - `instagram_business_basic`
   - `instagram_business_manage_insights`
3. Wait for approval (usually 1-2 weeks)

**For testing:** You can add test users in App Roles > Roles without app review.

### 5. Run the App

Simply open `index.html` in a web browser, or serve it with a local server:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

Then visit: `http://localhost:8000`

## Usage

### For Any User:

1. **Open the app** in your browser
2. **Click "Connect Instagram Account"**
3. **Login with Instagram** - Authorize the app
4. **View insights automatically** - Your metrics will load
5. **Logout when done** - Click the logout button

### How It Works:

1. User clicks connect button
2. Redirected to Instagram OAuth login
3. User authorizes the app
4. Instagram redirects back with authorization code
5. App exchanges code for access token
6. Token stored in localStorage (browser session)
7. App fetches and displays insights
8. User can logout to clear session

## Metrics Displayed

### Profile Info
- Profile picture
- Name
- Username

### Key Metrics
- **Followers** - Total follower count
- **Following** - Total following count  
- **Posts** - Total media count
- **Reach (30d)** - Total unique accounts reached (last 30 days)
- **Profile Views (30d)** - Total profile views (last 30 days)
- **Accounts Engaged (30d)** - Accounts that engaged with your content
- **Total Interactions (30d)** - Likes, comments, shares, and saves combined
- **Website Clicks (30d)** - Clicks on website link in bio

## API Used

- Instagram Graph API v22.0 with Instagram Login
- Direct access to Instagram Business Account (no Facebook Pages needed)
- Reference: [Instagram Media Insights API](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights)

## Troubleshooting

### "Redirect URI Mismatch"
- **Problem:** OAuth error about redirect URI
- **Solution:** Ensure the redirect URI in your Instagram app settings exactly matches your app URL (including trailing slash if present)

### "Unable to get Instagram account ID"
- **Problem:** Token invalid or expired
- **Solution:** Logout and login again to get a fresh token

### "App Not Approved"
- **Problem:** Can't login with regular accounts
- **Solution:** Add test users in App Dashboard > Roles, or submit for app review

### "Insights not available"
- **Problem:** Some metrics showing 0 or not available
- **Solution:** Insights require an Instagram **Business** account (not Personal or Creator). Some metrics need time to accumulate data.

### "Session expired"
- **Problem:** Token expired after some time
- **Solution:** Instagram tokens expire. The app will automatically prompt you to login again.

## Notes

- Access tokens expire (60-90 days for long-lived tokens)
- Insights data is from the last 30 days
- Some metrics may show 0 if not applicable to your account
- The app runs entirely client-side (no backend needed)

## Security Notes

⚠️ **Important Security Considerations:**

### Current Implementation (Simple Demo):
- App Secret is in client-side code (visible to users)
- Access tokens stored in localStorage (not encrypted)
- Token exchange happens client-side

### For Production Use:
1. **Move token exchange to backend server**
   - Never expose App Secret in client-side code
   - Create a backend endpoint to handle OAuth callback
   - Exchange authorization code on server
   - Return encrypted token to client

2. **Secure token storage**
   - Use httpOnly cookies instead of localStorage
   - Implement token refresh mechanism
   - Add CSRF protection

3. **Environment variables**
   - Store credentials in environment variables
   - Use .env files (never commit to git)
   - Different configs for dev/staging/production

4. **Rate limiting**
   - Implement API rate limiting
   - Add request throttling
   - Monitor for abuse

### Recommended Production Architecture:
```
User → Frontend (React/Vue/etc) → Backend API → Instagram API
                                      ↓
                                  Database (optional)
```

For this demo/testing purposes, the simple client-side approach works fine.

## License

MIT License - Free to use and modify

