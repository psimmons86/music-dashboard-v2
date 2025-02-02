import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, X } from 'lucide-react';
import * as postService from '../../services/postService';

export default function CommentSection({ postId, comments = [], onAddComment }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const addedComment = await onAddComment(postId, newComment.trim());
      setLocalComments([...localComments, addedComment]);
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error('Comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(postId, commentId);
      setLocalComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Delete comment error:', err);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <MessageSquare size={16} />
        {localComments.length} Comments
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Comment List */}
          <div className="space-y-3">
            {localComments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-emerald-800">
                        {comment.user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-800">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {/* Only show delete button for user's own comments */}
                  {userData?._id === comment.user._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 ml-10">{comment.content}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}