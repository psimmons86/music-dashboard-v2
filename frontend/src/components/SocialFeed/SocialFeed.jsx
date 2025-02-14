import { useState, useEffect } from 'react';
import PostItem from '../PostItem/PostItem';
import PostForm from '../PostForm/PostForm';
import * as postService from '../../services/postService';

export default function SocialFeed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postService.index();
      setPosts(response);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (postData) => {
    try {
      const newPost = await postService.create(postData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PostForm user={user} onPostCreated={handleNewPost} />
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <PostItem
            key={post._id}
            post={post}
            onDelete={handleDeletePost}
          />
        ))}
      </div>

      {posts.length === 0 && !error && (
        <div className="text-center text-gray-500 py-4">
          No posts yet. Be the first to share something!
        </div>
      )}
    </div>
  );
}
