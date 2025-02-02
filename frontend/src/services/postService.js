import { getToken } from './authService';

const BASE_URL = '/api/posts';

export async function create(postData) {
  return await sendRequest(BASE_URL, 'POST', postData);
}

export async function index() {
  return await sendRequest(BASE_URL);
}

export async function deletePost(id) {
  return await sendRequest(`${BASE_URL}/${id}`, 'DELETE');
}

export async function likePost(id) {
  return await sendRequest(`${BASE_URL}/${id}/like`, 'POST');
}

// New comment functions
export async function addComment(postId, content) {
  return await sendRequest(`${BASE_URL}/${postId}/comments`, 'POST', { content });
}

export async function deleteComment(postId, commentId) {
  return await sendRequest(`${BASE_URL}/${postId}/comments/${commentId}`, 'DELETE');
}

export async function updateComment(postId, commentId, content) {
  return await sendRequest(`${BASE_URL}/${postId}/comments/${commentId}`, 'PUT', { content });
}

// Helper function for all requests
async function sendRequest(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': getToken(),
    }
  };

  if (data) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);
  if (res.ok) {
    return res.json();
  } else {
    const error = await res.json();
    throw new Error(error.message || 'Something went wrong');
  }
}