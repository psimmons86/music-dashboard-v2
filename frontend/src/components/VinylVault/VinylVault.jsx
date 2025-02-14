import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc, Plus } from 'lucide-react';
import * as vinylService from '../../services/vinylService';
import VinylVaultCard from '../VinylVaultCard/VinylVaultCard';
import VinylRecordModal from './VinylRecordModal';

export default function VinylVault({ user }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/vinyl' } } });
      return;
    }
    fetchData();
  }, [user, page, navigate]);

  async function fetchData() {
    try {
      setLoading(true);
      setError('');
      const [statsData, collectionData] = await Promise.all([
        vinylService.getVinylStats(),
        vinylService.getVinylCollection(page)
      ]);
      setStats(statsData);
      setRecords(collectionData.records);
      setTotalPages(collectionData.totalPages);
    } catch (err) {
      console.error('Error fetching vinyl data:', err);
      setError('Failed to load vinyl collection');
    } finally {
      setLoading(false);
    }
  }

  const handleAddRecord = async (recordData) => {
    try {
      await vinylService.addVinylRecord(recordData);
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding record:', err);
      setError('Failed to add record');
    }
  };

  if (loading && !records.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Vinyl Collection</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <Disc className="h-6 w-6" />
                <h3 className="font-medium">Total Records</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <Disc className="h-6 w-6" />
                <h3 className="font-medium">Total Value</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">${stats.totalValue || 0}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <Disc className="h-6 w-6" />
                <h3 className="font-medium">Average Year</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.avgYear || 'N/A'}</p>
            </div>
          </div>
        )}

        {records.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {records.map(record => (
                <VinylVaultCard key={record._id} record={record} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      pageNum === page
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Disc className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Your collection is empty. Start by adding your first record!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Record
            </button>
          </div>
        )}

        <VinylRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddRecord}
        />
      </div>
    </div>
  );
}
