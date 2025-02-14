import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disc, BarChart2, Clock, Plus, ExternalLink } from 'lucide-react';
import * as vinylService from '../../services/vinylService';
import VinylVaultCard from '../VinylVaultCard/VinylVaultCard';

// Sample data for preview mode
const PREVIEW_DATA = {
  stats: {
    totalRecords: 248,
    uniqueGenres: 12,
    avgYear: 1978
  },
  recentRecords: [
    {
      _id: 'preview-1',
      title: 'Rumours',
      artist: 'Fleetwood Mac',
      year: 1977,
      genre: 'Rock',
      condition: 'Near Mint',
      coverImage: 'https://i.discogs.com/CjPeUPBwm3eN8ZbHnMLNNyFXd_VBSC0iyVFJh-bqVXE/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTM4NzE4/MzEtMTY0NzE5ODA4/OS05ODk5LmpwZWc.jpeg'
    },
    {
      _id: 'preview-2',
      title: 'Kind of Blue',
      artist: 'Miles Davis',
      year: 1959,
      genre: 'Jazz',
      condition: 'Very Good Plus',
      coverImage: 'https://i.discogs.com/AsvgmRwpNRHbAQLtHhHFEJ3M6MxHObKDpH-ETHb6kKE/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE1OTky/MjQtMTQ4NDc2OTk4/OS05NzU1LmpwZWc.jpeg'
    },
    {
      _id: 'preview-3',
      title: 'Purple Rain',
      artist: 'Prince',
      year: 1984,
      genre: 'Pop/Funk',
      condition: 'Excellent',
      coverImage: 'https://i.discogs.com/AH2_7hU0Cd5k1nhql8gkVQJNHI92HSVLSHNh6tAEWc0/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE1Mzc5/MTMtMTQzNDQ3NzU4/OC04MDY5LmpwZWc.jpeg'
    }
  ]
};

export default function VinylVaultWidget({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // Show preview data for non-logged in users
      setStats(PREVIEW_DATA.stats);
      setRecentRecords(PREVIEW_DATA.recentRecords);
    }
  }, [user]);

  async function fetchData() {
    try {
      setLoading(true);
      setError('');
      const [statsData, recentData] = await Promise.all([
        vinylService.getVinylStats(),
        vinylService.getRecentAdditions()
      ]);
      setStats(statsData);
      setRecentRecords(recentData);
    } catch (err) {
      console.error('Error fetching vinyl data:', err);
      setError('Failed to load vinyl collection data');
    } finally {
      setLoading(false);
    }
  }

  const handleStartTracking = () => {
    navigate('/vinyl');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/60 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Disc className="h-5 w-5" />
              <span className="font-medium">Total Records</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalRecords}</p>
          </div>

          <div className="bg-white/60 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <BarChart2 className="h-5 w-5" />
              <span className="font-medium">Genres</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.uniqueGenres}</p>
          </div>

          <div className="bg-white/60 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Avg. Year</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.avgYear}</p>
          </div>
        </div>
      )}

      {recentRecords.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-600">
              {user ? 'Recent Additions' : 'Example Collection'}
            </h3>
            <button
              onClick={handleStartTracking}
              className="text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              {user ? 'View All' : 'Start Tracking'}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRecords.slice(0, 3).map(record => (
              <VinylVaultCard key={record._id} record={record} />
            ))}
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg mt-4">
          <p className="text-sm text-emerald-800">
            Track your vinyl collection, discover insights about your music taste, and connect with other vinyl enthusiasts.
          </p>
        </div>
      )}
    </div>
  );
}
