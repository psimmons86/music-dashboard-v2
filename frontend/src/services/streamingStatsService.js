import * as spotifyService from './spotifyService';
import * as appleMusicService from './appleMusicService';

export async function getStreamingStats(service) {
  try {
    if (service === 'spotify') {
      const stats = await spotifyService.getStats();
      return {
        service: 'Spotify',
        stats
      };
    } else if (service === 'appleMusic') {
      const stats = await appleMusicService.getStats();
      return {
        service: 'Apple Music',
        stats
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching streaming stats:', error);
    throw error;
  }
}
