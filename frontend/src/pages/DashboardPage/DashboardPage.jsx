import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Users, Music, FileText, Crown, BarChart2, Disc, Album, Settings } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DashboardPage.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Components
import PostForm from '../../components/PostForm/PostForm';
import PostItem from '../../components/PostItem/PostItem';
import WeeklyPlaylist from '../../components/WeeklyPlaylist/WeeklyPlaylist';
import BlogFeed from '../../components/BlogFeed/BlogFeed';
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';
import DashboardItem from '../../components/DashboardItem/DashboardItem';
import VinylVaultWidget from '../../components/VinylVault/VinylVaultWidget';
import NewsSidebar from '../../components/NewsSidebar/NewsSidebar';
import MusicServiceSelection from '../../components/MusicServiceSelection/MusicServiceSelection';

// Services
import * as postService from '../../services/postService';
import * as playlistService from '../../services/playlistService';

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'music', x: 0, y: 0, w: 4, h: 4 },
    { i: 'stats', x: 4, y: 0, w: 4, h: 4 },
    { i: 'vinyl', x: 8, y: 0, w: 4, h: 4 },
    { i: 'playlist', x: 0, y: 4, w: 12, h: 4 },
    { i: 'social', x: 0, y: 8, w: 8, h: 5 },
    { i: 'blogs', x: 8, y: 8, w: 4, h: 5 },
  ],
  md: [
    { i: 'music', x: 0, y: 0, w: 5, h: 4 },
    { i: 'stats', x: 5, y: 0, w: 5, h: 4 },
    { i: 'vinyl', x: 0, y: 4, w: 5, h: 4 },
    { i: 'playlist', x: 5, y: 4, w: 5, h: 4 },
    { i: 'social', x: 0, y: 8, w: 10, h: 5 },
    { i: 'blogs', x: 0, y: 13, w: 10, h: 4 },
  ],
  sm: [
    { i: 'music', x: 0, y: 0, w: 3, h: 4 },
    { i: 'stats', x: 3, y: 0, w: 3, h: 4 },
    { i: 'vinyl', x: 0, y: 4, w: 3, h: 4 },
    { i: 'playlist', x: 3, y: 4, w: 3, h: 4 },
    { i: 'social', x: 0, y: 8, w: 6, h: 5 },
    { i: 'blogs', x: 0, y: 13, w: 6, h: 4 },
  ],
  xs: [
    { i: 'music', x: 0, y: 0, w: 4, h: 4 },
    { i: 'stats', x: 0, y: 4, w: 4, h: 4 },
    { i: 'vinyl', x: 0, y: 8, w: 4, h: 4 },
    { i: 'playlist', x: 0, y: 12, w: 4, h: 4 },
    { i: 'social', x: 0, y: 16, w: 4, h: 5 },
    { i: 'blogs', x: 0, y: 21, w: 4, h: 4 },
  ],
  xxs: [
    { i: 'music', x: 0, y: 0, w: 2, h: 4 },
    { i: 'stats', x: 0, y: 4, w: 2, h: 4 },
    { i: 'vinyl', x: 0, y: 8, w: 2, h: 4 },
    { i: 'playlist', x: 0, y: 12, w: 2, h: 4 },
    { i: 'social', x: 0, y: 16, w: 2, h: 5 },
    { i: 'blogs', x: 0, y: 21, w: 2, h: 4 },
  ],
};

export default function DashboardPage({ spotifyStatus, appleMusicStatus, onSpotifyUpdate, onAppleMusicUpdate, user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPlaylistSettings, setShowPlaylistSettings] = useState(false);
  const [showStatsSettings, setShowStatsSettings] = useState(false);
  const [stats, setStats] = useState({
    topArtists: [],
    topAlbums: [],
    topGenres: []
  });
  const [layouts, setLayouts] = useState(() => {
    try {
      const savedLayouts = localStorage.getItem('dashboardLayouts');
      return savedLayouts ? JSON.parse(savedLayouts) : DEFAULT_LAYOUTS;
    } catch (err) {
      console.error('Error loading layouts:', err);
      return DEFAULT_LAYOUTS;
    }
  });

  const isMusicConnected = spotifyStatus?.connected || appleMusicStatus?.connected;

  const fetchDashboardData = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);

      // Batch API calls together
      const promises = [postService.index()];
      
      // Only fetch stats if music service is connected
      if (isMusicConnected) {
        promises.push(playlistService.getUserStats());
      }

      const [postsData, statsData] = await Promise.all(promises);
      
      setPosts(postsData);
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      // Only set error if it's not an auth error (to prevent duplicate redirects)
      if (!err.message?.includes('authentication') && err.status !== 401) {
        setError('Failed to load some dashboard data. Please refresh to try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isMusicConnected]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Close settings panels when music service connection changes
  useEffect(() => {
    setShowPlaylistSettings(false);
    setShowStatsSettings(false);
  }, [spotifyStatus?.connected, appleMusicStatus?.connected]);

  const handleCreatePost = async (postData) => {
    try {
      setError('');
      const newPost = await postService.create(postData);
      setPosts(currentPosts => [newPost, ...currentPosts]);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setError('');
      await postService.deletePost(postId);
      setPosts(currentPosts => currentPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleLayoutChange = (layout, layouts) => {
    try {
      setLayouts(layouts);
      localStorage.setItem('dashboardLayouts', JSON.stringify(layouts));
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  };

  const CustomLink = ({ to, children, className }) => (
    <button 
      onClick={() => navigate(to)} 
      className={className}
    >
      {children}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={90}
            autoSize={true}
            isDraggable={true}
            isResizable={true}
            margin={[12, 12]}
            draggableHandle=".drag-handle"
            containerPadding={[16, 16]}
          >
            {/* Social Feed Section */}
            <div key="social" className="dashboard-item social-feed">
              <DashboardItem
                title="Social Feed"
                icon={Users}
                headerActions={
                  <CustomLink
                    to="/blog/create"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    Write Blog Post
                  </CustomLink>
                }
              >
                <div className="flex-1 overflow-hidden">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <PostForm onSubmit={handleCreatePost} />
                  <div className="space-y-4 mt-4">
                    {posts.map((post) => (
                      <PostItem
                        key={post._id}
                        post={post}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </div>
                </div>
              </DashboardItem>
            </div>

            {/* Vinyl Vault Section */}
            <div key="vinyl" className="dashboard-item">
              <DashboardItem
                title="Vinyl Vault"
                icon={Album}
              >
                <VinylVaultWidget user={user} />
              </DashboardItem>
            </div>

            {/* Music Player Section */}
            <div key="music" className="dashboard-item music-player">
              <DashboardItem
                title="Playlist Generator"
                icon={Music}
                headerActions={
                  isMusicConnected && (
                    <button
                      onClick={() => setShowPlaylistSettings(true)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Change Service
                    </button>
                  )
                }
              >
                {isMusicConnected ? (
                  showPlaylistSettings ? (
                    <div className="text-center">
                      <button
                        onClick={() => setShowPlaylistSettings(false)}
                        className="mb-4 text-sm text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Playlist Generator
                      </button>
                      <MusicServiceSelection 
                        onSpotifyUpdate={onSpotifyUpdate}
                        onAppleMusicUpdate={onAppleMusicUpdate}
                        spotifyStatus={spotifyStatus}
                        appleMusicStatus={appleMusicStatus}
                      />
                    </div>
                  ) : (
                    <PlaylistCard
                      title="Create Daily Mix"
                      actionButtonText="Generate Playlist"
                      loadingText="Creating your mix..."
                      onPlaylistCreated={(playlist) => {
                        console.log('Playlist created:', playlist);
                      }}
                    />
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-6">
                      Connect a music service to create playlists
                    </p>
                    <MusicServiceSelection 
                      onSpotifyUpdate={onSpotifyUpdate}
                      onAppleMusicUpdate={onAppleMusicUpdate}
                      spotifyStatus={spotifyStatus}
                      appleMusicStatus={appleMusicStatus}
                    />
                  </div>
                )}
              </DashboardItem>
            </div>

            {/* Stats Section */}
            <div key="stats" className="dashboard-item stats-section">
              <DashboardItem
                title="Music Stats"
                icon={BarChart2}
                headerActions={
                  isMusicConnected && (
                    <button
                      onClick={() => setShowStatsSettings(true)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Change Service
                    </button>
                  )
                }
              >
                {isMusicConnected ? (
                  showStatsSettings ? (
                    <div className="text-center">
                      <button
                        onClick={() => setShowStatsSettings(false)}
                        className="mb-4 text-sm text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Stats
                      </button>
                      <MusicServiceSelection 
                        onSpotifyUpdate={onSpotifyUpdate}
                        onAppleMusicUpdate={onAppleMusicUpdate}
                        spotifyStatus={spotifyStatus}
                        appleMusicStatus={appleMusicStatus}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Top Artists */}
                      <div className="space-y-3">
                        <h3 className="text-emerald-800 font-medium flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          Top Artists
                        </h3>
                        <div className="space-y-2">
                          {stats.topArtists && stats.topArtists.length > 0 ? (
                            <ul className="space-y-2">
                              {stats.topArtists.map((artist, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center justify-between border-b border-gray-100 pb-2">
                                  <span>{artist.name}</span>
                                  <span className="text-xs text-emerald-600 font-medium">#{index + 1}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">Loading artist data...</p>
                          )}
                        </div>
                      </div>

                      {/* Top Albums */}
                      <div className="space-y-3">
                        <h3 className="text-emerald-800 font-medium flex items-center gap-2">
                          <Disc className="h-4 w-4" />
                          Top Albums
                        </h3>
                        <div className="space-y-2">
                          {stats.topAlbums && stats.topAlbums.length > 0 ? (
                            <ul className="space-y-2">
                              {stats.topAlbums.map((album, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center justify-between border-b border-gray-100 pb-2">
                                  <span>{album.name}</span>
                                  <span className="text-xs text-emerald-600 font-medium">#{index + 1}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">Loading album data...</p>
                          )}
                        </div>
                      </div>

                      {/* Top Genres */}
                      <div className="space-y-3">
                        <h3 className="text-emerald-800 font-medium flex items-center gap-2">
                          <BarChart2 className="h-4 w-4" />
                          Top Genres
                        </h3>
                        <div className="space-y-2">
                          {stats.topGenres && stats.topGenres.length > 0 ? (
                            <ul className="space-y-2">
                              {stats.topGenres.map((genre, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center justify-between border-b border-gray-100 pb-2">
                                  <span>{genre.name}</span>
                                  <span className="text-xs text-emerald-600 font-medium">#{index + 1}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">Loading genre data...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-6">
                      Connect a music service to view your stats
                    </p>
                    <MusicServiceSelection 
                      onSpotifyUpdate={onSpotifyUpdate}
                      onAppleMusicUpdate={onAppleMusicUpdate}
                      spotifyStatus={spotifyStatus}
                      appleMusicStatus={appleMusicStatus}
                    />
                  </div>
                )}
              </DashboardItem>
            </div>

            {/* Weekly Playlist Section */}
            <div key="playlist" className="dashboard-item">
              <DashboardItem
                title="Weekly Playlist"
                icon={Crown}
              >
                <WeeklyPlaylist />
              </DashboardItem>
            </div>

            {/* Blog Feed Section */}
            <div key="blogs" className="dashboard-item blog-feed">
              <DashboardItem
                title="Daily Dispatch"
                icon={FileText}
                headerActions={
                  <CustomLink 
                    to="/blog" 
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    View All
                  </CustomLink>
                }
              >
                <BlogFeed />
              </DashboardItem>
            </div>

          </ResponsiveGridLayout>
        </div>
      </div>
      <NewsSidebar />
    </div>
  );
}
