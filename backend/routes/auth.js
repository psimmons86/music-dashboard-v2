const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Public auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected auth routes
const checkToken = require('../middleware/checkToken');
const protectedRouter = express.Router();
protectedRouter.use(checkToken);

protectedRouter.get('/profile', authController.getProfile);
protectedRouter.post('/update-role', authController.updateRole);

// Mount protected routes
router.use(protectedRouter);

module.exports = router;
