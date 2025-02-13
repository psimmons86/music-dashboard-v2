import { useState } from 'react';
import { Music } from 'lucide-react';
import SpotifyConnect from '../SpotifyConnect/SpotifyConnect';
import AppleMusicConnect from '../AppleMusicConnect/AppleMusicConnect';
import * as spotifyService from '../../services/spotifyService';
import * as appleMusicService from '../../services/appleMusicService';

export default function MusicServiceSelection({ onSpotifyUpdate, onAppleMusicUpdate, spotifyStatus, appleMusicStatus }) {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="p-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Music Services</h3>
        <div className="space-y-4">
          {/* Spotify Button */}
          {spotifyStatus?.connected ? (
            <div className="w-full py-3 px-4 flex items-center justify-between gap-3 bg-gray-100 text-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span>Spotify Connected</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await spotifyService.disconnectSpotify();
                    onSpotifyUpdate();
                    setSelectedService('apple');
                  } catch (err) {
                    console.error('Error disconnecting from Spotify:', err);
                  }
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Switch to Apple Music
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectedService('spotify')}
              className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-[#1DB954] text-white rounded-lg hover:bg-[#1ed760] transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connect with Spotify
            </button>
          )}

          {/* Apple Music Button */}
          {appleMusicStatus?.connected ? (
            <div className="w-full py-3 px-4 flex items-center justify-between gap-3 bg-gray-100 text-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Music className="w-6 h-6" />
                <span>Apple Music Connected</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await appleMusicService.disconnect();
                    onAppleMusicUpdate();
                    setSelectedService('spotify');
                  } catch (err) {
                    console.error('Error disconnecting from Apple Music:', err);
                  }
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Switch to Spotify
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectedService('apple')}
              className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-[#FB233B] text-white rounded-lg hover:bg-[#ff1e38] transition-colors"
            >
              <Music className="w-6 h-6" />
              Connect with Apple Music
            </button>
          )}
        </div>
      </div>

      {/* Service Connection Components */}
      {selectedService === 'spotify' && (
        <div className="mt-6">
          <button 
            onClick={() => setSelectedService(null)}
            className="mb-4 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Cancel
          </button>
          <SpotifyConnect onSuccess={onSpotifyUpdate} />
        </div>
      )}
      {selectedService === 'apple' && (
        <div className="mt-6">
          <button 
            onClick={() => setSelectedService(null)}
            className="mb-4 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Cancel
          </button>
          <AppleMusicConnect onSuccess={onAppleMusicUpdate} />
        </div>
      )}
    </div>
  );
}
