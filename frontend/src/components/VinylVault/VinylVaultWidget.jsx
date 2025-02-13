import { useState, useEffect } from 'react';
import { Disc, BarChart2, Clock, Plus } from 'lucide-react';
import * as vinylService from '../../services/vinylService';
import VinylVaultCard from '../VinylVaultCard/VinylVaultCard';
import { Link } from 'react-router-dom';

export default function VinylVaultWidget() {
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    async function fetchVinylData() {
      try {
        setLoading(true);
        setError('');
        const [statsData, recentData] = await Promise.all([
          vinylService.getVinylStats().catch(err => {
            if (err.status === 401) {
              setIsAuthenticated(false);
            }
            console.error('Error fetching vinyl stats:', err);
            return null;
          }),
          vinylService.getRecentAdditions().catch(err => {
            console.error('Error fetching recent additions:', err);
            return [];
          })
        ]);
        
        if (statsData) {
          setStats(statsData);
        }
        if (recentData) {
          setRecentRecords(recentData);
        }
      } catch (err) {
        console.error('Error fetching vinyl data:', err);
        if (err.status === 401) {
          setError('Please log in to view your vinyl collection');
          setIsAuthenticated(false);
        } else {
          setError('Failed to load vinyl collection data');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVinylData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <div className="text-center">
          <Disc className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Track Your Vinyl Collection
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Log in to start building your vinyl collection and track your records.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Log In to Get Started
          </Link>
        </div>
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
            <p className="text-2xl font-bold text-gray-800">{stats.avgYear || 'N/A'}</p>
          </div>
        </div>
      )}

      {recentRecords.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">Recent Additions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRecords.slice(0, 3).map(record => (
              <VinylVaultCard key={record._id} record={record} />
            ))}
          </div>
        </div>
      ) : stats?.totalRecords === 0 && (
        <div className="text-center p-6">
          <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Start building your collection by adding your first record
          </p>
        </div>
      )}
    </div>
  );
}
