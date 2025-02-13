import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsFeed from '../../components/NewsFeed/NewsFeed';
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';
import './HomePage.css';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('news');
  const navigate = useNavigate();

  const CustomLink = ({ to, children, className }) => (
    <button 
      onClick={() => navigate(to)} 
      className={className}
    >
      {children}
    </button>
  );

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to Music Dashboard</h1>
        <p>Your personal music news and playlist generator</p>
      </div>

      <div className="preview-sections">
        <section className="preview-box">
          <h2>Music News</h2>
          <div className="preview-content">
            <NewsFeed previewMode={true} maxItems={3} />
          </div>
          <CustomLink to="/signup" className="cta-button">
            Sign Up to Save Articles
          </CustomLink>
        </section>

        <section className="preview-box">
          <h2>Playlist Generator</h2>
          <div className="preview-content">
            <div className="mood-genres-preview">
              <h3>Generate random playlists: </h3>
              <ul>
                <li>Past Favorites</li>
                <li>Future Classics</li>
              </ul>
            </div>
          </div>
          <CustomLink to="/signup" className="cta-button">
            Sign Up to Create Playlists
          </CustomLink>
        </section>

        <section className="preview-box">
          <h2>How It Works</h2>
          <div className="preview-content">
            <div className="features-list">
              <div className="feature-item">
                <h3>1. Connect Spotify</h3>
              </div>
              <div className="feature-item">
                <h3>2. Generate & Save</h3>
                <p>Create custom playlists and save favorite articles</p>
              </div>
            </div>
          </div>
          <CustomLink to="/signup" className="cta-button">
            Get Started
          </CustomLink>
        </section>
      </div>
    </div>
  );
}
