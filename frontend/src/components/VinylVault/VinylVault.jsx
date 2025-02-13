import { useState, useEffect } from 'react';
import { Disc, BarChart2, Clock, Plus } from 'lucide-react';
import * as vinylService from '../../services/vinylService';
import VinylVaultCard from '../VinylVaultCard/VinylVaultCard';
import VinylRecordModal from './VinylRecordModal';

export default function VinylVault() {
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchVinylData() {
      try {
        setLoading(true);
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

    fetchVinylData();
  }, []);

  const handleAddRecord = async (recordData) => {
    try {
      await vinylService.addVinylRecord(recordData);
      // Refresh data
      const [statsData, recentData] = await Promise.all([
        vinylService.getVinylStats(),
        vinylService.getRecentAdditions()
      ]);
      setStats(statsData);
      setRecentRecords(recentData);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding record:', err);
      setError('Failed to add record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Vinyl Collection</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

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

      {recentRecords.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">Recent Additions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRecords.map(record => (
              <VinylVaultCard key={record._id} record={record} />
            ))}
          </div>
        </div>
      )}

      <VinylRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRecord}
      />
    </div>
  );
}
