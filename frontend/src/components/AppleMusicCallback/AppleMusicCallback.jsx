import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as appleMusicService from '../../services/appleMusicService';

export default function AppleMusicCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the token from the URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token found in URL');
        }

        // Store the token
        await appleMusicService.handleCallback(token);

        // Redirect back to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Apple Music callback error:', err);
        navigate('/dashboard', {
          replace: true,
          state: { error: 'Failed to connect to Apple Music' }
        });
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to Apple Music...</p>
      </div>
    </div>
  );
}
