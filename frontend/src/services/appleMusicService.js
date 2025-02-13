import sendRequest from './sendRequest';

const BASE_URL = '/api/applemusic';

export async function getAppleMusicStatus() {
  try {
    const response = await sendRequest(`${BASE_URL}/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting Apple Music status:', error);
    return { connected: false, error: error.message };
  }
}

export async function getMusicKitToken() {
  try {
    const response = await sendRequest(`${BASE_URL}/token`);
    return response.data.token;
  } catch (error) {
    console.error('Error getting MusicKit token:', error);
    throw error;
  }
}

export async function getUserToken(musicUserToken) {
  try {
    const response = await sendRequest(`${BASE_URL}/user-token`, 'POST', { musicUserToken });
    return response.data;
  } catch (error) {
    console.error('Error saving user token:', error);
    throw error;
  }
}

export async function disconnect() {
  try {
    await sendRequest(`${BASE_URL}/disconnect`, 'POST');
    return true;
  } catch (error) {
    console.error('Error disconnecting from Apple Music:', error);
    throw error;
  }
}

export async function getRecommendations() {
  try {
    const response = await sendRequest(`${BASE_URL}/recommendations`);
    return response.data;
  } catch (error) {
    console.error('Error getting Apple Music recommendations:', error);
    throw error;
  }
}

export async function getUserStats() {
  try {
    const response = await sendRequest(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error getting Apple Music user stats:', error);
    throw error;
  }
}

export async function createPlaylist(name, description, tracks) {
  try {
    const response = await sendRequest(`${BASE_URL}/playlists`, 'POST', {
      name,
      description,
      tracks
    });
    return response;
  } catch (error) {
    console.error('Error creating Apple Music playlist:', error);
    throw error;
  }
}
