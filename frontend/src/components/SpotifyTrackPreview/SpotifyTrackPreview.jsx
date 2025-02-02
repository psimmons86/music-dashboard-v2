import 'react';
import { Music, ExternalLink } from 'lucide-react';

export default function SpotifyTrackPreview({ track }) {
  if (!track) return null;

  return (
    <div className="bg-black/5 backdrop-blur-sm rounded-lg p-3 mt-3">
      <div className="flex items-center gap-3">
        {track.album?.images?.[0]?.url ? (
          <img
            src={track.album.images[0].url}
            alt={track.name}
            className="w-16 h-16 rounded-md"
          />
        ) : (
          <div className="w-16 h-16 bg-emerald-100 rounded-md flex items-center justify-center">
            <Music className="w-8 h-8 text-emerald-600" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {track.name}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {track.artists?.map(artist => artist.name).join(', ')}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {track.album?.name}
          </p>
        </div>

        <a
          href={track.external_urls?.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:text-emerald-700"
        >
          <ExternalLink size={20} />
        </a>
      </div>

      {track.preview_url && (
        <div className="mt-3">
          <audio
            controls
            src={track.preview_url}
            className="w-full h-8"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}