const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { touchLastActive } = require('../middleware/activity');
const { createBlog, listMyBlogs, updateBlog, deleteBlog } = require('../controllers/blog.controller');

router.post('/', authenticate, authorize('customer'), touchLastActive, createBlog);
router.get('/my', authenticate, authorize('customer'), touchLastActive, listMyBlogs);
router.put('/:id', authenticate, authorize('customer'), touchLastActive, updateBlog);
router.delete('/:id', authenticate, authorize('customer'), touchLastActive, deleteBlog);

module.exports = router;


