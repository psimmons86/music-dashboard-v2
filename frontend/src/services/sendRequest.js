import { getToken, handleAuthError } from './authService';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function sendRequest(url, method = 'GET', payload = null, retryCount = 0) {
  const options = { method };
  options.headers = {};
  
  // Add token if available
  const token = getToken();
  console.log('Request to:', url, 'Token:', token ? 'Present' : 'None'); // Debug log
  
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }
  // Only require token for protected routes
  else if (!url.includes('/login') && !url.includes('/signup') && !url.includes('/applemusic/token') && !url.includes('/applemusic/user-token')) {
    console.log('Protected route requires token:', url); // Debug log
    const error = new Error('No authentication token available');
    error.status = 401;
    throw error;
  }

  // Add content-type and body if needed
  if (payload) {
    if (payload instanceof FormData) {
      options.body = payload;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(payload);
    }
  }

  try {
    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    options.signal = controller.signal;

    console.log(`Sending ${method} request to ${url}`, options); // Debug log
    const res = await fetch(url, options);
    clearTimeout(timeoutId);
    console.log('Response status:', res.status); // Debug log
    
    // Handle no content response
    if (res.status === 204) {
      return null;
    }

    let json;
    try {
      json = await res.json();
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Invalid response format from server');
    }

    // Handle unsuccessful responses
    if (!res.ok) {
      console.error('Request failed:', JSON.stringify(json, null, 2));
      
      // Handle rate limiting
      if (res.status === 429 && retryCount < MAX_RETRIES) {
        const retryAfter = parseInt(res.headers.get('Retry-After')) || RETRY_DELAY;
        await delay(retryAfter);
        return sendRequest(url, method, payload, retryCount + 1);
      }

      // Handle authentication errors for protected routes
      if (res.status === 401 && !url.includes('/login') && !url.includes('/signup') && !url.includes('/applemusic/token') && !url.includes('/applemusic/user-token')) {
        const error = new Error(json.message || 'Authentication failed');
        error.status = 401;
        throw error;
      }

      const error = new Error(json.message || json.error || 'Request failed');
      error.status = res.status;
      error.response = json;
      throw error;
    }

    return json;
  } catch (err) {
    console.error('Request error:', err.message);

    // Handle network errors with retry
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    
    if (err.name === 'TypeError' && retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY);
      return sendRequest(url, method, payload, retryCount + 1);
    }

    // Handle authentication errors for protected routes
    if (err.status === 401 && !url.includes('/login') && !url.includes('/signup') && !url.includes('/applemusic/token') && !url.includes('/applemusic/user-token')) {
      // Let App.jsx handle the auth error and redirect
      throw err;
    }

    throw err;
  }
}
