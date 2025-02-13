import sendRequest from './sendRequest';

const BASE_URL = '/api/auth';

export function getToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return token;
  } catch (err) {
    console.error('Error parsing token:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

export function getUser() {
  const token = getToken();
  if (!token) {
    localStorage.removeItem('user'); // Clean up user data if token is invalid
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user;
  } catch (err) {
    console.error('Error getting user from token:', err);
    localStorage.removeItem('user');
    return null;
  }
}

export async function logIn(credentials) {
  try {
    const response = await sendRequest(`${BASE_URL}/login`, 'POST', credentials);
    
    if (!response.token || !response.user) {
      throw new Error('Invalid response from server');
    }
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response.user;
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (err.status === 401) {
      throw new Error('Invalid email or password');
    }
    throw err;
  }
}

export function logOut(redirectUrl = '/login') {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  if (redirectUrl) {
    const returnUrl = encodeURIComponent(redirectUrl);
    window.location.replace(`/login?returnUrl=${returnUrl}`);
  }
}

export async function signUp(userData) {
  try {
    const response = await sendRequest(`${BASE_URL}/signup`, 'POST', userData);
    
    if (!response.token || !response.user) {
      throw new Error('Invalid response from server');
    }
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response.user;
  } catch (err) {
    console.error('Signup error:', err);
    throw new Error(err.message || 'Signup failed');
  }
}

export function checkAuthStatus() {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isValid = payload.exp * 1000 > Date.now();
    if (!isValid) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return isValid;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
}

export function handleAuthError(error) {
  if (error.status === 401 || !checkAuthStatus()) {
    const currentPath = window.location.pathname;
    logOut(currentPath);
    return true;
  }
  return false;
}
