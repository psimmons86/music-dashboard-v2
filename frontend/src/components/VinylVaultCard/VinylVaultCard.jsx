import { Disc } from 'lucide-react';

export default function VinylVaultCard({ record }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {record.imageUrl ? (
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={record.imageUrl}
            alt={`${record.title} by ${record.artist}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
          <Disc className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate" title={record.title}>
          {record.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 truncate" title={record.artist}>
          {record.artist}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{record.year}</span>
          <span>{record.genre}</span>
          <span>{record.condition}</span>
        </div>
      </div>
    </div>
  );
}
