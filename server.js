// Simple Node.js server to handle Instagram OAuth token exchange
// This avoids CORS issues and keeps the App Secret secure

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Instagram App Credentials
const INSTAGRAM_CONFIG = {
    APP_ID: '1751885948806154',
    APP_SECRET: '6f39e0ffd4ffccbd731142cf3b1bb9dd',
    // IMPORTANT: This must match EXACTLY - NO trailing slash per Instagram docs
    // Instagram documentation: redirect_uri=https://5000mrr.com (no trailing slash)
    REDIRECT_URI: process.env.REDIRECT_URI || 'https://5000mrr.com'  // NO trailing slash
};

// Enable CORS for your frontend
app.use(cors({
    origin: ['https://5000mrr.com', 'http://localhost:8000', 'http://localhost:8080'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'Instagram OAuth Server Running' });
});

// Token exchange endpoint
app.post('/exchange-token', async (req, res) => {
    console.log('\n=== TOKEN EXCHANGE REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    
    const { code, redirect_uri } = req.body;

    if (!code) {
        console.error('❌ ERROR: No authorization code provided');
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Use redirect_uri from request if provided, otherwise use config
    // This ensures exact match with the one used in authorization request
    const redirectUri = redirect_uri || INSTAGRAM_CONFIG.REDIRECT_URI;

    console.log('\n📋 CONFIGURATION:');
    console.log('  - Code received:', code ? `${code.substring(0, 20)}...` : 'MISSING');
    console.log('  - Redirect URI from request:', redirect_uri || 'NOT PROVIDED');
    console.log('  - Redirect URI from config:', INSTAGRAM_CONFIG.REDIRECT_URI);
    console.log('  - Redirect URI to use:', redirectUri);
    console.log('  - Redirect URI length:', redirectUri.length);
    console.log('  - Redirect URI has trailing slash:', redirectUri.endsWith('/'));
    console.log('  - App ID:', INSTAGRAM_CONFIG.APP_ID);
    console.log('  - App Secret:', INSTAGRAM_CONFIG.APP_SECRET ? '***HIDDEN***' : 'MISSING');

    try {
        // Exchange code for access token
        const formData = new URLSearchParams();
        formData.append('client_id', INSTAGRAM_CONFIG.APP_ID);
        formData.append('client_secret', INSTAGRAM_CONFIG.APP_SECRET);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', redirectUri);
        formData.append('code', code);

        // Log what we're sending
        console.log('\n📤 REQUEST TO INSTAGRAM:');
        console.log('  - URL: https://api.instagram.com/oauth/access_token');
        console.log('  - Method: POST');
        console.log('  - Content-Type: application/x-www-form-urlencoded');
        console.log('  - Form data:');
        console.log('    * client_id:', INSTAGRAM_CONFIG.APP_ID);
        console.log('    * client_secret:', '***HIDDEN***');
        console.log('    * grant_type: authorization_code');
        console.log('    * redirect_uri:', redirectUri, `(length: ${redirectUri.length})`);
        console.log('    * code:', code ? `${code.substring(0, 20)}...` : 'MISSING');
        
        // Convert formData to string for logging (without secret)
        const formDataString = formData.toString();
        const formDataForLog = formDataString.replace(/client_secret=[^&]*/, 'client_secret=***HIDDEN***');
        console.log('  - Form data string:', formDataForLog);

        const response = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('\n📥 RESPONSE FROM INSTAGRAM:');
        console.log('  - Status:', response.status, response.statusText);
        console.log('  - Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

        const data = await response.json();
        console.log('  - Response body:', JSON.stringify(data, null, 2));

        if (data.error_message) {
            console.error('\n❌ INSTAGRAM ERROR:');
            console.error('  - Error message:', data.error_message);
            console.error('  - Error type:', data.error_type);
            console.error('  - Error code:', data.error_code);
            console.error('  - Full error:', JSON.stringify(data, null, 2));
            console.log('\n=== TOKEN EXCHANGE REQUEST END (ERROR) ===\n');
            return res.status(400).json({ error: data.error_message });
        }

        if (data.access_token) {
            console.log('\n✅ SUCCESS:');
            console.log('  - Access token received:', data.access_token ? `${data.access_token.substring(0, 20)}...` : 'MISSING');
            console.log('  - User ID:', data.user_id);
            console.log('  - Token type:', data.token_type);
            console.log('\n=== TOKEN EXCHANGE REQUEST END (SUCCESS) ===\n');
        }

        // Return the access token to the client
        res.json({
            access_token: data.access_token,
            user_id: data.user_id
        });

    } catch (error) {
        console.error('\n❌ EXCEPTION ERROR:');
        console.error('  - Error type:', error.name);
        console.error('  - Error message:', error.message);
        console.error('  - Error stack:', error.stack);
        console.log('\n=== TOKEN EXCHANGE REQUEST END (EXCEPTION) ===\n');
        res.status(500).json({ error: 'Failed to exchange token', details: error.message });
    }
});

// Get long-lived token endpoint (optional - extends token life to 60 days)
app.post('/get-long-lived-token', async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ error: 'Access token is required' });
    }

    try {
        const url = `https://graph.instagram.com/access_token?` +
            `grant_type=ig_exchange_token&` +
            `client_secret=${INSTAGRAM_CONFIG.APP_SECRET}&` +
            `access_token=${access_token}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        res.json({
            access_token: data.access_token,
            token_type: data.token_type,
            expires_in: data.expires_in
        });

    } catch (error) {
        console.error('Long-lived token error:', error);
        res.status(500).json({ error: 'Failed to get long-lived token' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Instagram OAuth server running on port ${PORT}`);
    console.log(`📝 Token exchange endpoint: /exchange-token`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Server is ready to accept requests`);
    
    // Log the actual URL if running on Render
    if (process.env.RENDER) {
        console.log(`🔗 Render URL: https://${process.env.RENDER_SERVICE_NAME}.onrender.com`);
    }
});

