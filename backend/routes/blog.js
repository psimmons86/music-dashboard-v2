const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog');
const checkToken = require('../middleware/checkToken');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');

// Public routes for reading blogs
router.get('/', blogController.getAll);
router.get('/:id', blogController.getOne);

// Protected routes for managing blogs
const protectedRouter = express.Router();
protectedRouter.use(checkToken);
protectedRouter.use(ensureLoggedIn);

protectedRouter.post('/', blogController.create);
protectedRouter.get('/user/posts', blogController.getUserBlogs);
protectedRouter.put('/:id', blogController.update);
protectedRouter.delete('/:id', blogController.delete);

// Register protected routes
router.use(protectedRouter);

module.exports = router;
