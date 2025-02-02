import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Users, Music, FileText, Crown, Newspaper, BarChart2, Disc, Bookmark } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DashboardPage.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Components
import PostForm from '../../components/PostForm/PostForm';
import PostItem from '../../components/PostItem/PostItem';
import NewsFeed from '../../components/NewsFeed/NewsFeed';
import SpotifyConnect from '../../components/SpotifyConnect/SpotifyConnect';
import WeeklyPlaylist from '../../components/WeeklyPlaylist/WeeklyPlaylist';
import BlogFeed from '../../components/BlogFeed/BlogFeed';
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';
import DashboardItem from '../../components/DashboardItem/DashboardItem';
import SavedArticles from '../../components/SavedArticles/SavedArticles';

// Services
import * as postService from '../../services/postService';
import * as playlistService from '../../services/playlistService';

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'social', x: 0, y: 0, w: 12, h: 12 },
    { i: 'music', x: 0, y: 12, w: 6, h: 12 },
    { i: 'stats', x: 6, y: 12, w: 6, h: 12 },
    { i: 'playlist', x: 0, y: 24, w: 6, h: 8 },
    { i: 'news', x: 6, y: 24, w: 6, h: 12 },
    { i: 'blogs', x: 0, y: 32, w: 12, h: 8 },
    { i: 'saved', x: 0, y: 40, w: 6, h: 12 },
  ],
  md: [
    { i: 'social', x: 0, y: 0, w: 10, h: 12 },
    { i: 'music', x: 0, y: 12, w: 5, h: 12 },
    { i: 'stats', x: 5, y: 12, w: 5, h: 12 },
    { i: 'playlist', x: 0, y: 24, w: 5, h: 8 },
    { i: 'news', x: 5, y: 24, w: 5, h: 12 },
    { i: 'blogs', x: 0, y: 32, w: 10, h: 8 },
    { i: 'saved', x: 0, y: 40, w: 5, h: 12 },
  ],
  sm: [
    { i: 'social', x: 0, y: 0, w: 6, h: 12 },
    { i: 'music', x: 0, y: 12, w: 3, h: 12 },
    { i: 'stats', x: 3, y: 12, w: 3, h: 12 },
    { i: 'playlist', x: 0, y: 24, w: 3, h: 8 },
    { i: 'news', x: 3, y: 24, w: 3, h: 12 },
    { i: 'blogs', x: 0, y: 32, w: 6, h: 8 },
    { i: 'saved', x: 0, y: 40, w: 3, h: 12 },
  ],
  xs: [
    { i: 'social', x: 0, y: 0, w: 4, h: 12 },
    { i: 'music', x: 0, y: 12, w: 4, h: 12 },
    { i: 'stats', x: 0, y: 24, w: 4, h: 12 },
    { i: 'playlist', x: 0, y: 36, w: 4, h: 8 },
    { i: 'news', x: 0, y: 44, w: 4, h: 12 },
    { i: 'blogs', x: 0, y: 56, w: 4, h: 8 },
    { i: 'saved', x: 0, y: 64, w: 4, h: 12 },
  ],
  xxs: [
    { i: 'social', x: 0, y: 0, w: 2, h: 12 },
    { i: 'music', x: 0, y: 12, w: 2, h: 12 },
    { i: 'stats', x: 0, y: 24, w: 2, h: 12 },
    { i: 'playlist', x: 0, y: 36, w: 2, h: 8 },
    { i: 'news', x: 0, y: 44, w: 2, h: 12 },
    { i: 'blogs', x: 0, y: 56, w: 2, h: 8 },
    { i: 'saved', x: 0, y: 64, w: 2, h: 12 },
  ],
};

export default function DashboardPage({ spotifyStatus, onSpotifyUpdate }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchPosts = useCallback(async () => {
    try {
      setError('');
      const postsData = await postService.index();
      setPosts(postsData);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please refresh the page to try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    async function fetchStats() {
      try {
        if (spotifyStatus?.connected) {
          const statsData = await playlistService.getUserStats();
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();
  }, [spotifyStatus?.connected]);

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
            rowHeight={30}
            autoSize={true}
            isDraggable={true}
            isResizable={true}
            margin={[16, 16]}
            draggableHandle=".drag-handle"
          >
            {/* Social Feed Section */}
            <div key="social" className="dashboard-item social-feed">
              <DashboardItem
                title="Social Feed"
                icon={Users}
                headerActions={
                  <Link
                    to="/blog/create"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    Write Blog Post
                  </Link>
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

            {/* Music Player Section */}
            <div key="music" className="dashboard-item music-player">
              <DashboardItem
                title="Playlist Generator"
                icon={Music}
              >
                {spotifyStatus?.connected ? (
                  <PlaylistCard
                    title="Create Daily Mix"
                    actionButtonText="Generate Playlist"
                    loadingText="Creating your mix..."
                    onPlaylistCreated={(playlist) => {
                      console.log('Playlist created:', playlist);
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-6">
                      Connect Spotify to create playlists
                    </p>
                    <SpotifyConnect onSuccess={onSpotifyUpdate} />
                  </div>
                )}
              </DashboardItem>
            </div>

            {/* Stats Section */}
            <div key="stats" className="dashboard-item stats-section">
              <DashboardItem
                title="Music Stats"
                icon={BarChart2}
              >
                {spotifyStatus?.connected ? (
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
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-6">
                      Connect Spotify to view your stats
                    </p>
                    <SpotifyConnect onSuccess={onSpotifyUpdate} />
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

{/* News Section */}
<div key="news" className="dashboard-item music-news">
  <DashboardItem
    title="Music News"
    icon={Newspaper}
  >
    <NewsFeed />
  </DashboardItem>
</div>

{/* Saved Articles Section */}
<div key="saved" className="dashboard-item">
  <DashboardItem
    title="Saved Articles"
    icon={Bookmark}
    className="bg-indigo-50/50"
  >
    <SavedArticles />
  </DashboardItem>
</div>

{/* Blog Feed Section */}
<div key="blogs" className="dashboard-item blog-feed">
  <DashboardItem
    title="Daily Dispatch"
    icon={FileText}
    headerActions={
      <Link 
        to="/blog" 
        className="text-sm text-emerald-600 hover:underline"
      >
        View All
      </Link>
    }
  >
    <BlogFeed />
  </DashboardItem>
</div>

</ResponsiveGridLayout>
</div>
</div>
</div>
);
}
