import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FileText, Crown, Loader2, Share2, Clock } from 'lucide-react';
import { Search } from 'lucide-react';
import * as blogService from '../../services/blogService';
import { tagColors } from '../../constants';

export default function BlogFeed() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedPosts, setSavedPosts] = useState(new Set());
  const observer = useRef();
  const ITEMS_PER_PAGE = 10;

  const lastBlogElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchBlogs() {
      try {
        setIsLoading(true);
        let category = '';
        if (filter === 'daily-dispatch') category = 'Daily Dispatch';
        if (filter === 'vinyl-vault') category = 'Vinyl Vault';
        
        const data = await blogService.getAllBlogs(page, ITEMS_PER_PAGE, sortBy, searchQuery, category);
        
        if (isMounted) {
          setBlogs(prev => page === 1 ? data.blogs : [...prev, ...data.blogs]);
          setHasMore(data.pagination.hasMore);
          // Load saved posts from localStorage
          const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
          setSavedPosts(new Set(saved));
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        if (isMounted) {
          setError('Failed to load blog posts');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBlogs();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [page, sortBy, searchQuery, filter]);

  // Reset page when search or sort changes
  useEffect(() => {
    setPage(1);
    setBlogs([]);
  }, [sortBy, searchQuery]);

  const filteredBlogs = blogs.filter(blog => {
    if (filter === 'all') return true;
    if (filter === 'official') return blog.isAdmin;
    if (filter === 'community') return !blog.isAdmin;
    if (filter === 'saved') return savedPosts.has(blog._id);
    if (filter === 'daily-dispatch') return blog.category === 'Daily Dispatch';
    if (filter === 'vinyl-vault') return blog.category === 'Vinyl Vault';
    return true;
  });

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const handleShare = async (blog) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.summary,
          url: window.location.origin + `/blog/${blog._id}`
        });
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(
          window.location.origin + `/blog/${blog._id}`
        );
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const toggleSave = (blogId) => {
    const newSavedPosts = new Set(savedPosts);
    if (savedPosts.has(blogId)) {
      newSavedPosts.delete(blogId);
    } else {
      newSavedPosts.add(blogId);
    }
    setSavedPosts(newSavedPosts);
    localStorage.setItem('savedPosts', JSON.stringify([...newSavedPosts]));
  };

  const CustomLink = ({ to, children, className }) => (
    <button 
      onClick={() => navigate(to)} 
      className={className}
    >
      {children}
    </button>
  );

  return (
    <Card className="w-full bg-white/60">
      <CardHeader className="flex flex-col space-y-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Blog Posts</h3>
          </div>
          <CustomLink 
            to="/blog" 
            className="text-sm text-emerald-600 hover:underline"
          >
            View All
          </CustomLink>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm bg-white/60 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Posts</option>
            <option value="daily-dispatch">Daily Dispatch</option>
            <option value="vinyl-vault">Vinyl Vault</option>
            <option value="official">Official</option>
            <option value="community">Community</option>
            <option value="saved">Saved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-white/60 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-4">{error}</div>
        ) : filteredBlogs.length > 0 ? (
          <div className="space-y-4">
            {filteredBlogs.map((blog, index) => (
              <div 
                key={blog._id}
                ref={index === filteredBlogs.length - 1 ? lastBlogElementRef : null}
                className="block bg-white/60 rounded-lg p-4 hover:bg-white/80 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${tagColors[blog.category] || 'bg-gray-100'}`}>
                        {blog.category}
                      </span>
                      {blog.isAdmin && (
                        <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          <Crown className="h-3 w-3" />
                          Official
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(blog)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Share post"
                      >
                        <Share2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  {blog.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <CustomLink to={`/blog/${blog._id}`}>
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/default-blog-image.jpg';
                          }}
                          loading="lazy"
                        />
                      </CustomLink>
                    </div>
                  )}

                  <div>
                    <CustomLink to={`/blog/${blog._id}`}>
                      <h4 className="font-medium text-lg text-gray-800 hover:text-emerald-600 transition-colors">
                        {blog.title}
                      </h4>
                    </CustomLink>
                    
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {blog.summary}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-2">
                        <span>{blog.author?.name || 'Unknown Author'}</span>
                        <span>•</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {calculateReadingTime(blog.content)} min read
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {blog.viewCount > 0 && (
                          <span>{blog.viewCount} view{blog.viewCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-4">
            No blog posts found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
