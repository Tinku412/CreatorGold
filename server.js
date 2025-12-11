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
    const { code, redirect_uri } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Use redirect_uri from request if provided, otherwise use config
    // This ensures exact match with the one used in authorization request
    const redirectUri = redirect_uri || INSTAGRAM_CONFIG.REDIRECT_URI;

    console.log('Token exchange request:', {
        hasCode: !!code,
        redirectUri: redirectUri,
        configRedirectUri: INSTAGRAM_CONFIG.REDIRECT_URI
    });

    try {
        // Exchange code for access token
        const formData = new URLSearchParams();
        formData.append('client_id', INSTAGRAM_CONFIG.APP_ID);
        formData.append('client_secret', INSTAGRAM_CONFIG.APP_SECRET);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', redirectUri);  // Use the exact redirect_uri from request
        formData.append('code', code);

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

        // Return the access token to the client
        res.json({
            access_token: data.access_token,
            user_id: data.user_id
        });

    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Failed to exchange token' });
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

