import { useState, useEffect } from 'react';
import { getUser } from '../../services/authService';
import { Routes, Route } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import HomePage from '../HomePage/HomePage';
import DashboardPage from '../DashboardPage/DashboardPage';
import BlogListPage from '../BlogListPage/BlogListPage';
import BlogDetailPage from '../BlogDetailPage/BlogDetailPage';
import BlogCreatePage from '../BlogCreatePage/BlogCreatePage';
import BlogEditPage from '../BlogEditPage/BlogEditPage';
import SignUpPage from '../SignUpPage/SignUpPage';
import LogInPage from '../LogInPage/LogInPage';
import ProfilePage from '../ProfilePage/ProfilePage';
import SpotifyCallback from '../../components/SpotifyCallback/SpotifyCallback';
import VinylVault from '../../components/VinylVault/VinylVault';

export default function App() {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    // Update user state if token changes
    const currentUser = getUser();
    if (currentUser !== user) {
      setUser(currentUser);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} setUser={setUser} />} />
        <Route path="/blog" element={<BlogListPage user={user} />} />
        <Route path="/blog/create" element={<BlogCreatePage user={user} />} />
        <Route path="/blog/:id" element={<BlogDetailPage user={user} />} />
        <Route path="/blog/:id/edit" element={<BlogEditPage user={user} />} />
        <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
        <Route path="/login" element={<LogInPage setUser={setUser} />} />
        <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
        <Route path="/spotify/callback" element={<SpotifyCallback />} />
        <Route path="/vinyl" element={<VinylVault user={user} />} />
      </Routes>
    </div>
  );
}
