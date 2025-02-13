import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import * as spotifyService from '../../services/spotifyService';
import * as appleMusicService from '../../services/appleMusicService';
import * as authService from '../../services/authService';
import './App.css';

// Components
import NavBar from '../../components/NavBar/NavBar';
import SpotifyCallback from '../../components/SpotifyCallback/SpotifyCallback';
import WeeklyPlaylistAdmin from '../../components/WeeklyPlaylistAdmin/WeeklyPlaylistAdmin';

// Pages
import HomePage from '../HomePage/HomePage';
import SignUpPage from '../SignUpPage/SignUpPage';
import LogInPage from '../LogInPage/LogInPage';
import DashboardPage from '../DashboardPage/DashboardPage';
import ProfilePage from '../ProfilePage/ProfilePage';
import BlogListPage from '../BlogListPage/BlogListPage';
import BlogDetailPage from '../BlogDetailPage/BlogDetailPage';
import BlogCreatePage from '../BlogCreatePage/BlogCreatePage';
import BlogEditPage from '../BlogEditPage/BlogEditPage';

export default function App() {
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return currentUser;
  });

  const [spotifyStatus, setSpotifyStatus] = useState({ 
    connected: false,
    checking: true 
  });

  const [appleMusicStatus, setAppleMusicStatus] = useState({
    connected: false,
    checking: true
  });

  const checkAppleMusicStatus = async () => {
    try {
      if (!user) {
        setAppleMusicStatus({ connected: false, checking: false });
        return;
      }

      const status = await appleMusicService.getAppleMusicStatus();
      console.log('Apple Music status check result:', status);
      
      setAppleMusicStatus({ 
        connected: status.connected, 
        checking: false,
        userId: status.userId
      });
    } catch (error) {
      console.error('Error checking Apple Music status:', error);
      setAppleMusicStatus({ 
        connected: false, 
        checking: false,
        error: error.message 
      });
    }
  };

  const checkSpotifyStatus = async () => {
    try {
      if (!user) {
        setSpotifyStatus({ connected: false, checking: false });
        return;
      }

      const status = await spotifyService.getSpotifyStatus();
      console.log('Spotify status check result:', status);
      
      setSpotifyStatus({ 
        connected: status.connected, 
        checking: false,
        userId: status.userId
      });
    } catch (error) {
      console.error('Error checking Spotify status:', error);
      setSpotifyStatus({ 
        connected: false, 
        checking: false,
        error: error.message 
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkSpotifyStatus();
      checkAppleMusicStatus();
    }
  }, [user]);

  // Enhanced setUser function to handle localStorage
  const handleSetUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUser(userData);
  };

  const RequireAuth = ({ children }) => {
    const currentUser = authService.getUser(); // Check token validity
    
    if (!currentUser) {
      // If token is invalid, clear user state and redirect
      handleSetUser(null);
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Ensure user state is in sync with token
    if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
      handleSetUser(currentUser);
    }

    return children;
  };

  return (
    <main className="App">
      <NavBar user={user} setUser={handleSetUser} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={!user ? <SignUpPage setUser={handleSetUser} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!user ? <LogInPage setUser={handleSetUser} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            <DashboardPage 
              spotifyStatus={spotifyStatus}
              appleMusicStatus={appleMusicStatus}
              onSpotifyUpdate={checkSpotifyStatus}
              onAppleMusicUpdate={checkAppleMusicStatus}
              user={user}
            />
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <ProfilePage user={user} />
          </RequireAuth>
        } />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/create" element={
          <RequireAuth>
            <BlogCreatePage />
          </RequireAuth>
        } />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/blog/:id/edit" element={
          <RequireAuth>
            <BlogEditPage />
          </RequireAuth>
        } />
        <Route path="/admin/weekly-playlist" element={
          <RequireAuth>
            <WeeklyPlaylistAdmin />
          </RequireAuth>
        } />
        <Route path="/spotify/callback" element={
          <RequireAuth>
            <SpotifyCallback onSuccess={checkSpotifyStatus} user={user} />
          </RequireAuth>
        } />
      </Routes>
    </main>
  );
}
