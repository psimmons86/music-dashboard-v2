const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.get('Authorization');
    console.log('Auth header:', authHeader); // Debug log

    if (!authHeader) {
      console.log('No auth header found'); // Debug log
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format in header'); // Debug log
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in Bearer header'); // Debug log
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    try {
      console.log('Verifying token with secret:', process.env.SECRET ? 'Secret exists' : 'No secret found'); // Debug log
      const decoded = jwt.verify(token, process.env.SECRET);
      console.log('Decoded token:', decoded); // Debug log

      if (!decoded.user) {
        console.log('No user in token payload'); // Debug log
        return res.status(401).json({ message: 'Invalid token payload' });
      }
      req.user = decoded.user;
      console.log('Token verified for user:', decoded.user.email); // Debug log
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
