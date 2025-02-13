import { useState, useEffect } from 'react';
import * as appleMusicService from '../../services/appleMusicService';

export default function AppleMusicConnect({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize MusicKit when component mounts
    const script = document.createElement('script');
    script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get developer token from backend
      const developerToken = await appleMusicService.getMusicKitToken();

      // Configure MusicKit
      await window.MusicKit.configure({
        developerToken,
        app: {
          name: 'Music Dashboard',
          build: '1.0.0'
        }
      });

      // Get instance and request authorization
      const music = window.MusicKit.getInstance();
      const musicUserToken = await music.authorize();

      // Send user token to backend
      await appleMusicService.getUserToken(musicUserToken);

      // Update parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error connecting to Apple Music:', err);
      setError('Failed to connect to Apple Music. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="text-red-600 text-sm mb-2">
          {error}
        </div>
      )}
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className={`
          px-6 py-2 rounded-lg font-medium text-white
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#FB233B] hover:bg-[#ff1e38] transition-colors'}
        `}
      >
        {isLoading ? 'Connecting...' : 'Connect Apple Music'}
      </button>
    </div>
  );
}
