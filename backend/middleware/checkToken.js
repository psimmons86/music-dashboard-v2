const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      if (!decoded.user) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }
      req.user = decoded.user;
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error('Token processing error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
