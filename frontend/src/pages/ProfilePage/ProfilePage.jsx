import { useState, useEffect } from 'react';
import { Music, Disc, Radio, Users2, Clock, Settings } from 'lucide-react';
import { 
  getProfile, 
  updateProfile, 
  uploadProfilePicture,
  getFavorites
} from '../../services/userService';
import { getSpotifyStatus } from '../../services/spotifyService';
import SpotifyConnect from "../../components/SpotifyConnect/SpotifyConnect";
import './ProfilePage.css';

const GENRES = [
  'Rock', 'Hip Hop', 'Electronic', 'Pop', 
  'Jazz', 'Classical', 'R&B', 'Country', 
  'Metal', 'Folk', 'Blues'
];

const MOODS = [
  'Happy', 'Chill', 'Energetic', 
  'Melancholic', 'Romantic', 'Focused'
];

export default function ProfilePage({ user }) {
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    socialLinks: {
      discogs: { url: '', verified: false },
      vinylVault: { url: '', verified: false },
      lastFm: { url: '', verified: false }
    }
  });
  const [stats, setStats] = useState({
    vinylCount: 0,
    followersCount: 0,
    listenTime: 0,
    topGenres: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    try {
      const [profile, favorites, spotifyStatus] = await Promise.all([
        getProfile(),
        getFavorites(),
        getSpotifyStatus()
      ]);

      setProfileData(profile);
      setStats({
        vinylCount: 142, // Example data
        followersCount: 89,
        listenTime: 2460,
        topGenres: favorites.favoriteGenres || []
      });
    } catch (err) {
      setError('Failed to load profile data');
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadProfilePicture(file);
        setSuccess('Profile picture updated');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to upload profile picture');
      }
    }
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="vinyl-profile">
          <div className="vinyl-record">
            <img
              src={profileData.profilePicture || '/default-profile.png'}
              alt=""
              className="profile-picture"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-picture-input"
            />
            <label
              htmlFor="profile-picture-input"
              className="profile-picture-overlay"
            >
              Change Picture
            </label>
          </div>
          <div className="profile-info">
            <h1>{profileData.name}</h1>
            {profileData.location && (
              <p className="location">📍 {profileData.location}</p>
            )}
            <p className="bio">{profileData.bio}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <Disc className="stat-icon" />
          <div className="stat-content">
            <h3>Vinyl Collection</h3>
            <p className="stat-value">{stats.vinylCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <Users2 className="stat-icon" />
          <div className="stat-content">
            <h3>Followers</h3>
            <p className="stat-value">{stats.followersCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" />
          <div className="stat-content">
            <h3>Listen Time</h3>
            <p className="stat-value">{Math.floor(stats.listenTime / 60)}h {stats.listenTime % 60}m</p>
          </div>
        </div>
        <div className="stat-card">
          <Radio className="stat-icon" />
          <div className="stat-content">
            <h3>Top Genre</h3>
            <p className="stat-value">{stats.topGenres[0] || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="profile-grid">
        {/* Recent Activity */}
        <div className="profile-section activity-feed">
          <h2>Recent Activity</h2>
          <div className="timeline">
            {[1,2,3].map(i => (
              <div key={i} className="timeline-item">
                <div className="timeline-icon">
                  <Music size={14} />
                </div>
                <div className="timeline-content">
                  <h4>Added new vinyl to collection</h4>
                  <p>Pink Floyd - Dark Side of the Moon</p>
                  <span className="timeline-date">2 days ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Services */}
        <div className="profile-section services-grid">
          <h2>Connected Services</h2>
          <div className="service-cards">
            <div className="service-card spotify">
              <img src="/spotify-icon.png" alt="Spotify" className="service-icon" />
              <div className="service-info">
                <h3>Spotify</h3>
                <p>Connected</p>
              </div>
            </div>
            <div className="service-card apple-music">
              <img src="/apple-music-icon.png" alt="Apple Music" className="service-icon" />
              <div className="service-info">
                <h3>Apple Music</h3>
                <p>Not Connected</p>
              </div>
            </div>
            <div className="service-card discogs">
              <img src="/discogs-icon.png" alt="Discogs" className="service-icon" />
              <div className="service-info">
                <h3>Discogs</h3>
                <p>Connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => setIsEditing(true)}
          className="settings-button"
        >
          <Settings size={16} />
          Edit Profile
        </button>
      </div>
    </div>
  );
}
