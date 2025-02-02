# Music Dashboard v2

A modern full-stack web application for music enthusiasts featuring an enhanced blog system, Spotify integration, and social features.

## Features

### Enhanced Blog System
- Infinite scrolling for seamless content browsing
- Real-time search functionality
- Advanced sorting (newest, oldest, most popular)
- Category filtering (All, Official, Community, Saved)
- Reading time estimates
- Social sharing capabilities
- Save/bookmark functionality
- Improved image loading with lazy loading

### Music Integration
- Spotify Connect integration
- Weekly playlist generation
- Music stats and analytics
- Track previews
- Personalized recommendations

### Social Features
- User profiles
- Comments and discussions
- Post sharing
- Community engagement

## Tech Stack

### Frontend
- React
- Vite
- TailwindCSS
- Lucide Icons
- React Router

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd music-dashboard-v2
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

4. Start the development servers:
```bash
# Start backend server (from root directory)
npm run dev

# Start frontend server (from frontend directory)
cd frontend
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
