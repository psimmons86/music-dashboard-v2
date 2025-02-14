import { useState, useEffect } from 'react';
import { BarChart3, Clock, Music2, PlayCircle } from 'lucide-react';
import * as streamingStatsService from '../../services/streamingStatsService';

export default function StreamingStats({ selectedService }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      if (!selectedService) return;
      
      try {
        setIsLoading(true);
        const data = await streamingStatsService.getStreamingStats(selectedService);
        setStats(data);
      } catch (error) {
        console.error('Error fetching streaming stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [selectedService]);

  if (!selectedService) {
    return (
      <div className="text-center text-gray-500 py-8">
        Connect a music service to view your streaming stats
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      icon: PlayCircle,
      label: 'Total Plays',
      value: stats.stats.totalPlays || 0,
    },
    {
      icon: Clock,
      label: 'Hours Listened',
      value: stats.stats.hoursListened?.toFixed(1) || 0,
    },
    {
      icon: Music2,
      label: 'Top Genre',
      value: stats.stats.topGenre || 'N/A',
    },
    {
      icon: BarChart3,
      label: 'Avg. Daily Plays',
      value: stats.stats.avgDailyPlays?.toFixed(1) || 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center text-center">
          <Icon className="w-6 h-6 text-emerald-600 mb-2" />
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className="font-semibold text-gray-800">{value}</div>
        </div>
      ))}
    </div>
  );
}
