# Backend Deployment Guide

The Instagram OAuth token exchange must happen on a backend server due to CORS restrictions. Here are several simple deployment options:

## Option 1: Deploy to Render (Easiest - Free Tier)

### Steps:

1. **Create account at [Render.com](https://render.com)**

2. **Push your code to GitHub:**
   ```bash
   git init
   git add server.js package.json
   git commit -m "Add backend server"
   git push origin main
   ```

3. **Deploy on Render:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name:** instagram-oauth-server
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free
   - Click "Create Web Service"

4. **Get your URL:**
   - Once deployed, you'll get a URL like: `https://instagram-oauth-server.onrender.com`

5. **Update frontend:**
   - In `app.js`, change:
   ```javascript
   BACKEND_URL: 'https://your-app-name.onrender.com'
   ```

**Note:** Free tier sleeps after 15 min of inactivity, may be slow on first request.

---

## Option 2: Deploy to Railway (Fast & Free)

### Steps:

1. **Go to [Railway.app](https://railway.app)**

2. **Sign up with GitHub**

3. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Node.js

4. **Configure:**
   - Railway will automatically deploy
   - Click "Generate Domain" to get public URL
   - Example: `https://instagram-oauth-production.up.railway.app`

5. **Update frontend:**
   ```javascript
   BACKEND_URL: 'https://your-app.up.railway.app'
   ```

---

## Option 3: Deploy to Vercel (Serverless)

### Create Serverless Function:

1. **Create `/api/exchange-token.js`:**

```javascript
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://5000mrr.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code required' });
    }

    try {
        const formData = new URLSearchParams({
            client_id: '1751885948806154',
            client_secret: '6f39e0ffd4ffccbd731142cf3b1bb9dd',
            grant_type: 'authorization_code',
            redirect_uri: 'https://5000mrr.com',
            code: code
        });

        const response = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = await response.json();

        if (data.error_message) {
            return res.status(400).json({ error: data.error_message });
        }

        return res.json({
            access_token: data.access_token,
            user_id: data.user_id
        });
    } catch (error) {
        return res.status(500).json({ error: 'Token exchange failed' });
    }
}
```

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Update frontend:**
   ```javascript
   BACKEND_URL: 'https://your-project.vercel.app/api'
   ```

---

## Option 4: Run Locally (For Testing)

### Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start backend server:**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

3. **In another terminal, start frontend:**
   ```bash
   python -m http.server 8000
   ```

4. **Update `app.js` temporarily:**
   ```javascript
   BACKEND_URL: 'http://localhost:3000'
   REDIRECT_URI: 'http://localhost:8000'
   ```

5. **Also update Instagram app settings:**
   - Add `http://localhost:8000/` to Valid OAuth Redirect URIs

---

## Option 5: Deploy to Azure (Azure DevOps / App Service)

Azure offers multiple deployment options. Here are the best ones:

### Option 5A: Azure App Service (Easiest - Recommended)

#### Steps:

1. **Create Azure Account:**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign up (free tier available)

2. **Create App Service:**
   - Click **"Create a resource"**
   - Search for **"Web App"**
   - Click **"Create"**
   - Fill in:
     - **Subscription:** Your subscription
     - **Resource Group:** Create new or use existing
     - **Name:** `instagram-oauth-server` (must be unique)
     - **Runtime stack:** Node 18 LTS or Node 20 LTS
     - **Operating System:** Linux
     - **Region:** Choose closest to you
     - **Pricing Plan:** Free (F1) or Basic (B1) for production
   - Click **"Review + create"** → **"Create"**

3. **Deploy via Azure CLI:**
   ```bash
   # Install Azure CLI
   # Windows: https://aka.ms/installazurecliwindows
   # Mac: brew install azure-cli
   # Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

   # Login
   az login

   # Create deployment user (one time)
   az webapp deployment user set --user-name <username> --password <password>

   # Configure local git
   az webapp deployment source config-local-git \
     --name instagram-oauth-server \
     --resource-group <your-resource-group>

   # Get deployment URL
   az webapp deployment source show \
     --name instagram-oauth-server \
     --resource-group <your-resource-group> \
     --query url --output tsv

   # Add remote and push
   git remote add azure <deployment-url>
   git push azure main
   ```

4. **Or Deploy via GitHub Actions (Recommended):**
   
   Create `.github/workflows/azure-deploy.yml`:
   ```yaml
   name: Deploy to Azure App Service
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '18'
       
       - name: Install dependencies
         run: npm install
       
       - name: Deploy to Azure
         uses: azure/webapps-deploy@v2
         with:
           app-name: 'instagram-oauth-server'
           publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
           package: .
   ```
   
   Then:
   - Go to Azure Portal → Your App Service → **Deployment Center**
   - Click **"GitHub"** → Authorize → Select repo
   - Azure will auto-create the GitHub Action workflow
   - Or manually add `AZURE_WEBAPP_PUBLISH_PROFILE` secret to GitHub

5. **Configure Environment Variables:**
   - Go to Azure Portal → Your App Service
   - **Configuration** → **Application settings**
   - Add:
     - `INSTAGRAM_APP_ID` = `1751885948806154`
     - `INSTAGRAM_APP_SECRET` = `6f39e0ffd4ffccbd731142cf3b1bb9dd`
     - `REDIRECT_URI` = `https://5000mrr.com`
     - `PORT` = `8080` (Azure uses PORT env var)
   - Click **"Save"**

6. **Update server.js for Azure:**
   ```javascript
   const PORT = process.env.PORT || 3000; // Azure sets PORT automatically
   ```

7. **Get your URL:**
   - Your app will be at: `https://instagram-oauth-server.azurewebsites.net`
   - Or set custom domain in **Custom domains** section

8. **Update frontend:**
   ```javascript
   BACKEND_URL: 'https://instagram-oauth-server.azurewebsites.net'
   ```

**Azure Free Tier:**
- ✅ 10 apps per subscription
- ✅ 1 GB storage
- ✅ 1 GB outbound data transfer/month
- ✅ Shared infrastructure
- ✅ Custom domain support

---

### Option 5B: Azure Functions (Serverless)

#### Steps:

1. **Create Function App:**
   - Azure Portal → **Create a resource** → **Function App**
   - Fill in details (similar to App Service)
   - **Runtime stack:** Node.js
   - Click **"Create"**

2. **Create Function:**
   - Go to your Function App → **Functions** → **Create**
   - Choose **"HTTP trigger"**
   - **Name:** `exchange-token`
   - **Authorization level:** Function (or Anonymous for testing)

3. **Replace function code:**
   
   Create `exchange-token/index.js`:
   ```javascript
   module.exports = async function (context, req) {
       // Enable CORS
       context.res = {
           headers: {
               'Access-Control-Allow-Origin': 'https://5000mrr.com',
               'Access-Control-Allow-Methods': 'POST, OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type'
           }
       };
       
       if (req.method === 'OPTIONS') {
           return context.res;
       }
       
       const { code } = req.body;
       
       if (!code) {
           context.res.status = 400;
           context.res.body = { error: 'Code required' };
           return;
       }
       
       try {
           const formData = new URLSearchParams({
               client_id: process.env.INSTAGRAM_APP_ID,
               client_secret: process.env.INSTAGRAM_APP_SECRET,
               grant_type: 'authorization_code',
               redirect_uri: process.env.REDIRECT_URI,
               code: code
           });
           
           const fetch = require('node-fetch');
           const response = await fetch('https://api.instagram.com/oauth/access_token', {
               method: 'POST',
               body: formData,
               headers: {
                   'Content-Type': 'application/x-www-form-urlencoded'
               }
           });
           
           const data = await response.json();
           
           if (data.error_message) {
               context.res.status = 400;
               context.res.body = { error: data.error_message };
               return;
           }
           
           context.res.status = 200;
           context.res.body = {
               access_token: data.access_token,
               user_id: data.user_id
           };
       } catch (error) {
           context.res.status = 500;
           context.res.body = { error: 'Token exchange failed' };
       }
   };
   ```

4. **Add `package.json` in function folder:**
   ```json
   {
     "name": "exchange-token",
     "version": "1.0.0",
     "dependencies": {
       "node-fetch": "^2.7.0"
     }
   }
   ```

5. **Configure Environment Variables:**
   - Function App → **Configuration** → **Application settings**
   - Add same variables as App Service

6. **Get Function URL:**
   - Function → **Get function URL**
   - Copy the URL (e.g., `https://your-app.azurewebsites.net/api/exchange-token?code=...`)

7. **Update frontend:**
   ```javascript
   BACKEND_URL: 'https://your-app.azurewebsites.net/api'
   ```

---

### Option 5C: Azure DevOps Pipelines (CI/CD)

If you want automated deployments via Azure DevOps:

1. **Create Azure DevOps Project:**
   - Go to [dev.azure.com](https://dev.azure.com)
   - Create new project

2. **Create Pipeline:**
   - **Pipelines** → **Create Pipeline**
   - Connect your repository (GitHub, Azure Repos, etc.)
   - Choose **"Node.js with Express.js"** template
   - Or use this YAML:

   ```yaml
   trigger:
     - main
   
   pool:
     vmImage: 'ubuntu-latest'
   
   steps:
   - task: NodeTool@0
     inputs:
       versionSpec: '18.x'
     displayName: 'Install Node.js'
   
   - script: |
       npm install
     displayName: 'npm install'
   
   - task: AzureWebApp@1
     inputs:
       azureSubscription: 'Your Subscription'
       appName: 'instagram-oauth-server'
       package: '.'
       runtimeStack: 'NODE|18-lts'
   ```

3. **Configure Service Connection:**
   - **Project Settings** → **Service connections**
   - Create Azure Resource Manager connection
   - Authorize with your Azure account

4. **Set Variables:**
   - **Pipelines** → **Library**
   - Add variable group with:
     - `INSTAGRAM_APP_ID`
     - `INSTAGRAM_APP_SECRET`
     - `REDIRECT_URI`

---

### Azure Pricing:

**Free Tier (F1):**
- ✅ 60 minutes compute time/day
- ✅ 1 GB storage
- ✅ Shared infrastructure
- ✅ Perfect for testing

**Basic Tier (B1):**
- 💰 ~$13/month
- ✅ Always on
- ✅ Custom domains
- ✅ SSL certificates
- ✅ Production ready

---

## Option 6: Deploy to Heroku

### Steps:

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login and create app:**
   ```bash
   heroku login
   heroku create instagram-oauth-server
   ```

3. **Create Procfile:**
   ```
   web: node server.js
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Get URL:**
   ```bash
   heroku open
   ```

6. **Update frontend:**
   ```javascript
   BACKEND_URL: 'https://your-app.herokuapp.com'
   ```

---

## Recommended Options:

### For Simplicity:
- **Render** or **Railway** - Easiest setup, free tier, auto-deploy

### For Enterprise/Production:
- **Azure App Service** - Enterprise-grade, scalable, integrated with Azure DevOps
- **Azure Functions** - Serverless, pay-per-use, auto-scaling

### For CI/CD Automation:
- **Azure DevOps Pipelines** - Full CI/CD, integrated with Azure services

---

## After Deployment:

1. **Update Instagram App Settings:**
   - Go to your Instagram app dashboard
   - Update "Valid OAuth Redirect URIs" to include your production URL

2. **Update Frontend Config:**
   - In `app.js`, set `BACKEND_URL` to your deployed backend URL
   - Update `REDIRECT_URI` to your frontend URL

3. **Test the Flow:**
   - Visit your frontend
   - Click "Connect Instagram Account"
   - Should redirect to Instagram
   - After authorization, should redirect back and show insights

---

## Security Notes:

- ✅ App Secret is now secure on backend (not exposed to users)
- ✅ CORS is properly configured
- ✅ Backend validates all requests
- 🔒 For production, consider adding:
  - Rate limiting
  - Request validation
  - API key authentication
  - Environment variables for secrets

---

## Environment Variables (Recommended):

Instead of hardcoding, use environment variables:

**Backend (server.js):**
```javascript
const INSTAGRAM_CONFIG = {
    APP_ID: process.env.INSTAGRAM_APP_ID,
    APP_SECRET: process.env.INSTAGRAM_APP_SECRET,
    REDIRECT_URI: process.env.REDIRECT_URI
};
```

**Set in Render/Railway:**
- Dashboard → Environment Variables
- Add: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `REDIRECT_URI`

---

## Troubleshooting:

**CORS Error:**
- Check CORS origin in server.js includes your frontend URL
- Ensure backend is actually running/deployed

**Token Exchange Failed:**
- Verify redirect URI matches Instagram app settings exactly
- Check backend logs for detailed error

**Backend Not Responding:**
- Free tier services may sleep - first request might be slow
- Check deployment logs

---

Choose the option that works best for you. **Render** is recommended for simplicity!

