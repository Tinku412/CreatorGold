# 🚀 Azure Deployment Guide

Complete guide to deploy your Instagram OAuth backend to Azure using Azure DevOps or Azure Portal.

## 🎯 Quick Start (5 minutes)

### Option A: Azure Portal (No DevOps needed)

1. **Go to [portal.azure.com](https://portal.azure.com)**
2. **Create Web App:**
   - Click **"Create a resource"**
   - Search **"Web App"** → Create
   - Fill in:
     - Name: `instagram-oauth-server` (unique)
     - Runtime: Node 18 LTS
     - OS: Linux
     - Plan: Free (F1)
   - Click **"Create"**

3. **Deploy via GitHub:**
   - App Service → **Deployment Center**
   - Source: **GitHub**
   - Authorize → Select repo → Branch: `main`
   - Click **"Save"**
   - Azure auto-deploys!

4. **Set Environment Variables:**
   - **Configuration** → **Application settings**
   - Add:
     ```
     INSTAGRAM_APP_ID = 1751885948806154
     INSTAGRAM_APP_SECRET = 6f39e0ffd4ffccbd731142cf3b1bb9dd
     REDIRECT_URI = https://5000mrr.com
     ```
   - Click **"Save"**

5. **Get URL:**
   - Your app: `https://instagram-oauth-server.azurewebsites.net`
   - Update `app.js`: `BACKEND_URL: 'https://instagram-oauth-server.azurewebsites.net'`

**Done!** 🎉

---

## 🔧 Option B: Azure DevOps Pipelines (CI/CD)

### Step 1: Create Azure DevOps Project

1. Go to [dev.azure.com](https://dev.azure.com)
2. Create new organization (if needed)
3. Create new project: **"Instagram OAuth"**

### Step 2: Connect Repository

1. **Repos** → **Import repository**
2. Import from GitHub (or push your code)
3. Your code is now in Azure Repos

### Step 3: Create Pipeline

1. **Pipelines** → **Create Pipeline**
2. **Azure Repos Git** (or GitHub)
3. Select your repository
4. **"Starter pipeline"** or **"Node.js with Express.js"**

### Step 4: Configure Pipeline YAML

Replace the YAML with:

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.x'
  appName: 'instagram-oauth-server'
  resourceGroup: 'your-resource-group'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '$(nodeVersion)'
    displayName: 'Install Node.js'

  - script: |
      npm install
    displayName: 'Install dependencies'

  - task: AzureWebApp@1
    inputs:
      azureSubscription: 'Your Subscription'
      appName: '$(appName)'
      package: '.'
      runtimeStack: 'NODE|18-lts'
    displayName: 'Deploy to Azure'
```

### Step 5: Create Service Connection

1. **Project Settings** → **Service connections**
2. **New service connection** → **Azure Resource Manager**
3. **Service principal (automatic)**
4. Select your subscription and resource group
5. Name it: `Your Subscription`
6. Click **"Save"**

### Step 6: Run Pipeline

1. **Pipelines** → Your pipeline
2. Click **"Run pipeline"**
3. Watch it deploy! 🚀

---

## 📦 Option C: Azure Functions (Serverless)

### Step 1: Create Function App

1. Azure Portal → **Create a resource**
2. **Function App** → Create
3. Fill in:
   - Name: `instagram-oauth-func`
   - Runtime: Node.js 18
   - Plan: Consumption (pay-per-use)
4. Click **"Create"**

### Step 2: Create HTTP Function

1. Function App → **Functions** → **Create**
2. **HTTP trigger**
3. Name: `exchange-token`
4. Authorization: **Function** (or Anonymous for testing)

### Step 3: Add Function Code

Replace the function code with:

```javascript
const fetch = require('node-fetch');

module.exports = async function (context, req) {
    // CORS headers
    context.res = {
        headers: {
            'Access-Control-Allow-Origin': 'https://5000mrr.com',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
    
    // Handle preflight
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

### Step 4: Add Dependencies

Create `package.json` in function folder:

```json
{
  "name": "exchange-token",
  "version": "1.0.0",
  "dependencies": {
    "node-fetch": "^2.7.0"
  }
}
```

### Step 5: Configure Environment Variables

1. Function App → **Configuration** → **Application settings**
2. Add:
   - `INSTAGRAM_APP_ID`
   - `INSTAGRAM_APP_SECRET`
   - `REDIRECT_URI`
3. Click **"Save"**

### Step 6: Get Function URL

1. Function → **Get function URL**
2. Copy URL (e.g., `https://your-app.azurewebsites.net/api/exchange-token`)
3. Update frontend: `BACKEND_URL: 'https://your-app.azurewebsites.net/api'`

---

## 🔐 Environment Variables

### For App Service:

Azure Portal → Your App → **Configuration** → **Application settings**

Add:
```
INSTAGRAM_APP_ID = 1751885948806154
INSTAGRAM_APP_SECRET = 6f39e0ffd4ffccbd731142cf3b1bb9dd
REDIRECT_URI = https://5000mrr.com
PORT = 8080
```

### For Functions:

Same process, but in Function App → **Configuration**

### For Pipelines:

**Pipelines** → **Library** → **Variable groups**

Create group: `instagram-config`
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `REDIRECT_URI`

Reference in pipeline:
```yaml
variables:
  - group: instagram-config
```

---

## 📊 Azure Pricing

### App Service Free Tier (F1):
- ✅ 60 minutes compute/day
- ✅ 1 GB storage
- ✅ Shared infrastructure
- ✅ Perfect for testing
- ⚠️ Apps sleep after inactivity

### App Service Basic (B1):
- 💰 ~$13/month
- ✅ Always on
- ✅ Custom domains
- ✅ SSL included
- ✅ Production ready

### Functions Consumption:
- 💰 Pay per execution
- ✅ First 1M requests/month free
- ✅ Auto-scaling
- ✅ Serverless

---

## 🛠️ Update server.js for Azure

Make sure your `server.js` uses environment variables:

```javascript
const INSTAGRAM_CONFIG = {
    APP_ID: process.env.INSTAGRAM_APP_ID || '1751885948806154',
    APP_SECRET: process.env.INSTAGRAM_APP_SECRET || '6f39e0ffd4ffccbd731142cf3b1bb9dd',
    REDIRECT_URI: process.env.REDIRECT_URI || 'https://5000mrr.com'
};

const PORT = process.env.PORT || 3000; // Azure sets PORT automatically
```

---

## 🔍 Troubleshooting

### "Deployment failed"
- Check build logs in Azure Portal
- Verify Node.js version matches
- Check `package.json` is correct

### "Function not found"
- Verify function name matches URL
- Check function is enabled
- Verify HTTP method (POST)

### "Environment variables not working"
- Restart app after adding variables
- Check variable names match exactly
- Verify no typos

### "CORS error"
- Update CORS origin in server.js
- Check frontend URL matches
- Verify backend is deployed

---

## 📚 Additional Resources

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Azure Functions Docs](https://docs.microsoft.com/azure/azure-functions/)
- [Azure DevOps Docs](https://docs.microsoft.com/azure/devops/)
- [Node.js on Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)

---

## ✅ Checklist

- [ ] Azure account created
- [ ] App Service or Function App created
- [ ] Code deployed
- [ ] Environment variables set
- [ ] Backend URL updated in frontend
- [ ] CORS configured correctly
- [ ] Tested OAuth flow
- [ ] Custom domain (optional)

---

**Azure is perfect for enterprise deployments!** It offers excellent integration with Azure DevOps for full CI/CD automation. 🚀

