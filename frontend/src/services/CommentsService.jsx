import sendRequest from './sendRequest';

const BASE_URL = '/api/posts';

export function addComment(postId, content, replyTo = null) {
  return sendRequest(`${BASE_URL}/${postId}/comments`, 'POST', {
    content,
    replyTo
  });
}

export function deleteComment(postId, commentId) {
  return sendRequest(`${BASE_URL}/${postId}/comments/${commentId}`, 'DELETE');
}

export function updateComment(postId, commentId, content) {
  return sendRequest(`${BASE_URL}/${postId}/comments/${commentId}`, 'PUT', {
    content
  });
}