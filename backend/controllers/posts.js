const Post = require('../models/post');

async function index(req, res) {
  try {
    const posts = await Post.find({})
      .populate('user')
      .populate('likes')
      .populate('comments.user')
      .sort('-createdAt');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
}

async function create(req, res) {
  try {
    const post = await Post.create({
      content: req.body.content,
      currentSong: req.body.currentSong,
      user: req.user._id,
      likes: [],
      comments: []
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user')
      .populate('comments.user');
    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create post' });
  }
}

async function deletePost(req, res) {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted successfully', postId: post._id });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete post' });
  }
}

async function likePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);
    const wasLiked = likeIndex > -1;

    if (wasLiked) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('user')
      .populate('likes')
      .populate('comments.user');

    res.json({
      isLiked: !wasLiked,
      likeCount: updatedPost.likes.length,
      post: updatedPost
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update like' });
  }
}

async function addComment(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create the new comment
    const comment = {
      content: req.body.content,
      user: req.user._id
    };

    // Add comment to the post
    post.comments.push(comment);
    await post.save();

    // Get the populated post with the new comment
    const populatedPost = await Post.findById(post._id)
      .populate('user')
      .populate('comments.user');

    // Get just the new comment
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.json(newComment);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
}

async function deleteComment(req, res) {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment subdocument
    const commentIndex = post.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];

    // Check authorization
    if (comment.user.toString() !== req.user._id.toString() && 
        post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}

async function updateComment(req, res) {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment subdocument
    const comment = post.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    // Update the comment
    comment.content = req.body.content;
    await post.save();

    // Get the updated comment with populated user
    const updatedPost = await Post.findById(post._id).populate('comments.user');
    const updatedComment = updatedPost.comments.find(
      c => c._id.toString() === req.params.commentId
    );

    res.json(updatedComment);
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ message: 'Failed to update comment' });
  }
}

module.exports = {
  create,
  index,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  updateComment
};