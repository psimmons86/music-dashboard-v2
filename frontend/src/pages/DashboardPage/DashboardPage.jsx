import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardItem from '../../components/DashboardItem/DashboardItem';
import SpotifyConnect from '../../components/SpotifyConnect/SpotifyConnect';
import AppleMusicConnect from '../../components/AppleMusicConnect/AppleMusicConnect';
import WeeklyPlaylist from '../../components/WeeklyPlaylist/WeeklyPlaylist';
import StreamingStats from '../../components/StreamingStats/StreamingStats';
import NewsSidebar from '../../components/NewsSidebar/NewsSidebar';
import VinylVaultWidget from '../../components/VinylVault/VinylVaultWidget';
import RecentBlog from '../../components/RecentBlog/RecentBlog';
import SocialFeed from '../../components/SocialFeed/SocialFeed';

export default function DashboardPage({ user, setUser }) {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  if (!user) {
    navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Your Music Dashboard
          </h1>
          <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-200 to-teal-200 rounded-full" />
          <span className="text-gray-500 text-lg">Welcome back!</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Music Services */}
            <DashboardItem title="Music Services" className="bg-gradient-to-br from-white/90 to-emerald-50/90 backdrop-blur-sm shadow-md rounded-xl border border-emerald-100/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SpotifyConnect user={user} onConnect={() => setSelectedService('spotify')} />
                <AppleMusicConnect user={user} onConnect={() => setSelectedService('appleMusic')} />
              </div>
            </DashboardItem>

            {/* Streaming Stats */}
            <DashboardItem title="Streaming Stats" className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm shadow-md rounded-xl border border-blue-100/50">
              <StreamingStats selectedService={selectedService} />
            </DashboardItem>

            {/* Weekly Playlist */}
            <DashboardItem title="Weekly Playlist" className="bg-gradient-to-br from-white/90 to-teal-50/90 backdrop-blur-sm shadow-md rounded-xl border border-teal-100/50">
              <WeeklyPlaylist user={user} selectedService={selectedService} />
            </DashboardItem>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Dispatch Blog */}
            <DashboardItem title="Daily Dispatch" className="bg-gradient-to-br from-white/90 to-rose-50/90 backdrop-blur-sm shadow-md rounded-xl border border-rose-100/50">
              <RecentBlog />
            </DashboardItem>

            {/* Social Feed */}
            <DashboardItem title="Social Feed" className="bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-sm shadow-md rounded-xl border border-amber-100/50">
                <SocialFeed user={user} />
            </DashboardItem>

            {/* Vinyl Collection */}
            <DashboardItem title="Vinyl Collection" className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm shadow-md rounded-xl border border-purple-100/50">
              <VinylVaultWidget user={user} />
            </DashboardItem>
          </div>
        </div>
      </div>
      <NewsSidebar />
    </div>
  );
}
