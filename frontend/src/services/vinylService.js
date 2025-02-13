import sendRequest from './sendRequest';

const BASE_URL = '/api/vinyl';

export async function getVinylStats() {
  return sendRequest(`${BASE_URL}/stats`);
}

export async function getRecentAdditions() {
  return sendRequest(`${BASE_URL}/recent`);
}

export async function searchDiscogs(query) {
  return sendRequest(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
}

export async function addVinylRecord(recordData) {
  return sendRequest(BASE_URL, 'POST', recordData);
}

export async function updateVinylRecord(id, recordData) {
  return sendRequest(`${BASE_URL}/${id}`, 'PUT', recordData);
}

export async function deleteVinylRecord(id) {
  return sendRequest(`${BASE_URL}/${id}`, 'DELETE');
}
