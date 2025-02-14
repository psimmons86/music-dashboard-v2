import sendRequest from './sendRequest';

const BASE_URL = '/api/vinyl';

export async function getVinylCollection(page = 1) {
  return sendRequest(`${BASE_URL}?page=${page}`);
}

export async function getVinylStats() {
  return sendRequest(`${BASE_URL}/stats`);
}

export async function getRecentAdditions(limit = 3) {
  return sendRequest(`${BASE_URL}/recent?limit=${limit}`);
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

export async function getVinylRecord(id) {
  return sendRequest(`${BASE_URL}/${id}`);
}

export async function searchVinylRecords(query) {
  return sendRequest(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
}

export async function getVinylsByGenre(genre) {
  return sendRequest(`${BASE_URL}/genre/${encodeURIComponent(genre)}`);
}

export async function getVinylsByYear(year) {
  return sendRequest(`${BASE_URL}/year/${year}`);
}

export async function getVinylsByCondition(condition) {
  return sendRequest(`${BASE_URL}/condition/${encodeURIComponent(condition)}`);
}
