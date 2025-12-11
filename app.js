// Instagram API Configuration
const CONFIG = {
    APP_ID: '1751885948806154',
    // IMPORTANT: This must match EXACTLY in:
    // 1. Instagram App Settings (Valid OAuth Redirect URIs)
    // 2. server.js REDIRECT_URI
    // 3. Instagram documentation shows NO trailing slash
    REDIRECT_URI: 'https://5000mrr.com',  // NO trailing slash - matches Instagram docs
    API_VERSION: 'v22.0',
    BASE_URL: 'https://graph.instagram.com',
    AUTH_URL: 'https://www.instagram.com/oauth/authorize',  // Updated to match Instagram docs
    // Backend server URL - update this to your deployed backend URL
    BACKEND_URL: 'https://creatorgold.onrender.com'
};

// Get access token from localStorage
function getAccessToken() {
    return localStorage.getItem('instagram_access_token');
}

// Set access token in localStorage
function setAccessToken(token) {
    localStorage.setItem('instagram_access_token', token);
}

// Clear access token
function clearAccessToken() {
    localStorage.removeItem('instagram_access_token');
    localStorage.removeItem('instagram_user');
}

// Check if user is logged in
function isLoggedIn() {
    return !!getAccessToken();
}

// Format large numbers (e.g., 1000 -> 1K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    document.getElementById('loading').style.display = 'none';
    document.getElementById('fetchBtn').disabled = false;
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('error');
    errorDiv.classList.remove('show');
}

// Instagram OAuth Login
function loginWithInstagram() {
    const scope = [
        'instagram_business_basic',
        'instagram_business_manage_insights'
    ].join(',');
    
    const authUrl = `${CONFIG.AUTH_URL}?` +
        `client_id=${CONFIG.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(CONFIG.REDIRECT_URI)}&` +
        `scope=${scope}&` +
        `response_type=code`;
    
    window.location.href = authUrl;
}

// Exchange authorization code for access token via backend
async function exchangeCodeForToken(code) {
    try {
        // Pass redirect_uri to backend to ensure exact match
        const response = await fetch(`${CONFIG.BACKEND_URL}/exchange-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                code: code,
                redirect_uri: CONFIG.REDIRECT_URI  // Pass redirect_uri to ensure exact match
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw error;
    }
}

// Handle OAuth callback
async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorReason = urlParams.get('error_reason');
    const errorDescription = urlParams.get('error_description');

    if (error) {
        showError(`Login failed: ${errorDescription || error}`);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return false;
    }

    if (code) {
        try {
            showToast('Exchanging authorization code...', 'info');
            
            const tokenData = await exchangeCodeForToken(code);
            
            if (tokenData.access_token) {
                setAccessToken(tokenData.access_token);
                if (tokenData.user_id) {
                    localStorage.setItem('instagram_user_id', tokenData.user_id);
                }
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                showToast('Login successful!', 'success');
                updateUI();
                return true;
            }
        } catch (error) {
            showError(`Failed to complete login: ${error.message}`);
            window.history.replaceState({}, document.title, window.location.pathname);
            return false;
        }
    }

    return false;
}

// Show toast message
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Fetch Instagram account ID - Using Instagram Login (direct access)
async function getAccountId() {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login first.');
        }

        // With Instagram Login, we can access the account directly using /me
        const response = await fetch(
            `${CONFIG.BASE_URL}/${CONFIG.API_VERSION}/me?fields=id,username&access_token=${accessToken}`
        );
        
        const data = await response.json();
        
        if (data.error) {
            if (data.error.code === 190) {
                // Token expired
                clearAccessToken();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.error.message);
        }

        if (!data.id) {
            throw new Error('Unable to get Instagram account ID. Please check your access token.');
        }

        return data.id;
    } catch (error) {
        console.error('Error getting account ID:', error);
        throw error;
    }
}

// Fetch profile information
async function getProfile(accountId) {
    try {
        const accessToken = getAccessToken();
        const fields = [
            'id',
            'username',
            'name',
            'profile_picture_url',
            'followers_count',
            'follows_count',
            'media_count'
        ].join(',');

        const response = await fetch(
            `${CONFIG.BASE_URL}/${CONFIG.API_VERSION}/${accountId}?fields=${fields}&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

// Fetch insights data - Account level insights
async function getInsights(accountId) {
    try {
        const accessToken = getAccessToken();
        
        // Calculate date range (last 30 days)
        const today = new Date();
        const since = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30).getTime() / 1000);
        const until = Math.floor(Date.now() / 1000);

        // Available metrics for Instagram Business accounts with Instagram Login
        // Valid metrics: reach, follower_count, website_clicks, profile_views, accounts_engaged, 
        // total_interactions, likes, comments, shares, saves, etc.
        const metrics = [
            'reach',
            'profile_views',
            'accounts_engaged',
            'total_interactions',
            'website_clicks',
            'follower_count'
        ].join(',');

        const response = await fetch(
            `${CONFIG.BASE_URL}/${CONFIG.API_VERSION}/${accountId}/insights?metric=${metrics}&period=day&since=${since}&until=${until}&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            console.error('Insights API Error:', data.error);
            throw new Error(data.error.message);
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching insights:', error);
        throw error;
    }
}

// Process insights data
function processInsights(insightsData) {
    const processed = {};

    insightsData.forEach(metric => {
        const name = metric.name;
        let total = 0;

        if (metric.values && metric.values.length > 0) {
            // Calculate total/average based on the metric
            metric.values.forEach(value => {
                if (value.value !== null) {
                    total += value.value;
                }
            });

            // For some metrics, we want the total, for others the average
            if (name === 'reach' || name === 'impressions') {
                // For reach and impressions, show total
                processed[name] = total;
            } else {
                // For others, show average
                const validValues = metric.values.filter(v => v.value !== null).length;
                processed[name] = validValues > 0 ? Math.round(total / validValues) : 0;
            }
        } else {
            processed[name] = 0;
        }
    });

    return processed;
}

// Display profile information
function displayProfile(profile) {
    const profileSection = document.getElementById('profileSection');
    
    profileSection.innerHTML = `
        <img src="${profile.profile_picture_url}" alt="${profile.name}" class="profile-pic" onerror="this.src='https://via.placeholder.com/80'">
        <div class="profile-info">
            <div class="profile-name">${profile.name || profile.username}</div>
            <div class="profile-username">@${profile.username}</div>
        </div>
    `;
}

// Display metrics
function displayMetrics(profile, insights) {
    const metricsGrid = document.getElementById('metricsGrid');
    
    const metrics = [
        { label: 'Followers', value: profile.followers_count || 0, icon: '👥' },
        { label: 'Following', value: profile.follows_count || 0, icon: '➕' },
        { label: 'Posts', value: profile.media_count || 0, icon: '📸' },
        { label: 'Reach (30d)', value: insights.reach || 0, icon: '📊' },
        { label: 'Profile Views (30d)', value: insights.profile_views || 0, icon: '👤' },
        { label: 'Accounts Engaged (30d)', value: insights.accounts_engaged || 0, icon: '🤝' },
        { label: 'Total Interactions (30d)', value: insights.total_interactions || 0, icon: '❤️' },
        { label: 'Website Clicks (30d)', value: insights.website_clicks || 0, icon: '🔗' }
    ];

    metricsGrid.innerHTML = metrics.map(metric => `
        <div class="metric-card">
            <div class="metric-label">${metric.icon} ${metric.label}</div>
            <div class="metric-value">${formatNumber(metric.value)}</div>
        </div>
    `).join('');
}

// Update UI based on login state
function updateUI() {
    const fetchBtn = document.getElementById('fetchBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isLoggedIn()) {
        fetchBtn.textContent = 'Get My Insights';
        fetchBtn.onclick = fetchInsights;
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        // Auto-fetch insights after login
        fetchInsights();
    } else {
        fetchBtn.textContent = 'Connect Instagram Account';
        fetchBtn.onclick = loginWithInstagram;
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Hide insights
        document.getElementById('insights').style.display = 'none';
    }
}

// Logout function
function logout() {
    clearAccessToken();
    document.getElementById('insights').style.display = 'none';
    hideError();
    updateUI();
    showToast('Logged out successfully', 'success');
}

// Main function to fetch and display insights
async function fetchInsights() {
    const fetchBtn = document.getElementById('fetchBtn');
    const loading = document.getElementById('loading');
    const insights = document.getElementById('insights');

    // Check if logged in
    if (!isLoggedIn()) {
        loginWithInstagram();
        return;
    }

    // Reset UI
    fetchBtn.disabled = true;
    loading.style.display = 'block';
    insights.style.display = 'none';
    hideError();

    try {
        // Step 1: Get Instagram Business Account ID
        console.log('Getting account ID...');
        const accountId = await getAccountId();
        console.log('Account ID:', accountId);

        // Step 2: Get profile information
        console.log('Fetching profile...');
        const profile = await getProfile(accountId);
        console.log('Profile:', profile);

        // Step 3: Get insights data
        console.log('Fetching insights...');
        const insightsData = await getInsights(accountId);
        console.log('Insights data:', insightsData);

        // Step 4: Process insights
        const processedInsights = processInsights(insightsData);
        console.log('Processed insights:', processedInsights);

        // Step 5: Display data
        displayProfile(profile);
        displayMetrics(profile, processedInsights);

        // Show results
        loading.style.display = 'none';
        insights.style.display = 'block';
        fetchBtn.disabled = false;

    } catch (error) {
        console.error('Error:', error);
        
        if (error.message.includes('expired') || error.message.includes('Invalid')) {
            clearAccessToken();
            updateUI();
        }
        
        showError(`Error: ${error.message}. Please check the console for details.`);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    // Check for OAuth callback
    const hasCallback = await handleOAuthCallback();
    
    // Update UI based on login state
    updateUI();
});

