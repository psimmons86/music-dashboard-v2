import { Disc, Calendar, Tag } from 'lucide-react';

export default function VinylVaultCard({ record }) {
  return (
    <div className="bg-white/60 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {record.coverImage ? (
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={record.coverImage}
            alt={`${record.title} by ${record.artist}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/default-vinyl.png';
            }}
          />
        </div>
      ) : (
        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
          <Disc className="h-12 w-12 text-gray-300" />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{record.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">{record.artist}</p>

        <div className="space-y-2">
          {record.releaseYear && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{record.releaseYear}</span>
            </div>
          )}
          
          {record.genre && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tag className="h-3 w-3" />
              <span>{record.genre}</span>
            </div>
          )}

          {record.condition && (
            <div className="mt-2">
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${record.condition === 'Mint' ? 'bg-green-100 text-green-700' :
                  record.condition === 'Near Mint' ? 'bg-emerald-100 text-emerald-700' :
                  record.condition === 'Very Good Plus' ? 'bg-blue-100 text-blue-700' :
                  record.condition === 'Very Good' ? 'bg-yellow-100 text-yellow-700' :
                  record.condition === 'Good' ? 'bg-orange-100 text-orange-700' :
                  record.condition === 'Fair' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'}
              `}>
                {record.condition}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
