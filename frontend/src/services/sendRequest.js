import { getToken, handleAuthError } from './authService';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function sendRequest(url, method = 'GET', payload = null, retryCount = 0) {
  const options = { method };
  options.headers = {};
  
  // Add token if available and not a login/signup request
  if (!url.includes('/login') && !url.includes('/signup')) {
    const token = getToken();
    if (!token) {
      // If no token is available for a protected route, handle as auth error
      handleAuthError({ status: 401 });
      throw new Error('No authentication token available');
    }
    options.headers.Authorization = `Bearer ${token}`;
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

    console.log(`Sending ${method} request to ${url}`);
    const res = await fetch(url, options);
    clearTimeout(timeoutId);
    
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

      // Handle authentication errors immediately
      if (res.status === 401 && !url.includes('/login')) {
        handleAuthError({ status: 401, message: json.message });
        throw new Error(json.message || 'Authentication failed');
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

    // Handle authentication errors
    if (err.status === 401 && !url.includes('/login')) {
      handleAuthError(err);
    }

    throw err;
  }
}
