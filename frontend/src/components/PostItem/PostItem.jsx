import { useState, useEffect } from 'react';
import { Heart, Trash2, Loader2, Music } from 'lucide-react';
import * as postService from '../../services/postService';
import SpotifyTrackPreview from '../SpotifyTrackPreview/SpotifyTrackPreview';
import CommentSection from '../CommentSection/CommentSection';

export default function PostItem({ post, onDelete }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [comments, setComments] = useState(post.comments || []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
        
        // Set initial like state
        if (post.likes) {
          setLikeCount(post.likes.length);
          setIsLiked(post.likes.includes(user._id));
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, [post.likes]);

  const handleLikeClick = async () => {
    try {
      const response = await postService.likePost(post._id);
      if (response) {
        setIsLiked(response.isLiked);
        setLikeCount(response.likeCount);
      }
    } catch (err) {
      setError('Failed to update like');
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      await postService.deletePost(post._id);
      onDelete(post._id);
    } catch (err) {
      setError('Failed to delete post');
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const newComment = await postService.addComment(postId, content);
      setComments(prevComments => [...prevComments, newComment]);
      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw new Error('Failed to add comment');
    }
  };

  return (
    <div className="relative bg-white/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {post.user?.name ? post.user.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{post.user?.name || 'Unknown User'}</h4>
            <time className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLikeClick}
            className={`relative z-10 flex items-center gap-1 px-3 py-1 rounded-full transition-colors 
              ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Heart size={16} className={isLiked ? 'fill-current' : ''} />
            <span className="text-sm">{likeCount}</span>
          </button>

          {userData?._id === post.user?._id && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="relative z-10 text-gray-400 hover:text-red-500 transition-colors p-2 
                rounded-full hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {post.currentSong && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-emerald-50 p-2 rounded-lg">
          <Music size={16} className="text-emerald-500" />
          <span>Now Playing: {post.currentSong}</span>
        </div>
      )}

      <CommentSection
        postId={post._id}
        comments={comments}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
