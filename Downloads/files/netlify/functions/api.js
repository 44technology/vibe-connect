// Netlify Function to proxy backend API requests
// This allows you to use your backend deployed elsewhere (Railway, Render, etc.)
// or you can deploy backend separately

const axios = require('axios');

// Backend URL - Set this in Netlify environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend-url.railway.app';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get the path from the request
    const path = event.path.replace('/.netlify/functions/api', '');
    const url = `${BACKEND_URL}${path}`;

    // Get query string if exists
    const queryString = event.queryStringParameters
      ? '?' + new URLSearchParams(event.queryStringParameters).toString()
      : '';

    const fullUrl = url + queryString;

    // Forward the request to backend
    const config = {
      method: event.httpMethod,
      url: fullUrl,
      headers: {
        'Content-Type': event.headers['content-type'] || 'application/json',
      },
      data: event.body ? JSON.parse(event.body) : undefined,
      timeout: 30000,
    };

    // Handle file uploads (multipart/form-data)
    if (event.headers['content-type']?.includes('multipart/form-data')) {
      // For file uploads, we need to pass the raw body
      // This is a simplified version - for production, use proper multipart handling
      config.data = event.body;
      config.headers = {
        ...config.headers,
        'Content-Type': event.headers['content-type'],
      };
    }

    const response = await axios(config);

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Backend API error',
      }),
    };
  }
};

