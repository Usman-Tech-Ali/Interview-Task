const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listCustomers, listAllBlogs, updateBlogStatus, approveRejectCustomerRequest } = require('../controllers/admin.controller');
const { touchLastActive } = require('../middleware/activity');

router.use(authenticate, authorize('admin'), touchLastActive);

router.get('/customers', listCustomers);
router.get('/blogs', listAllBlogs);
router.put('/blogs/:id/status', updateBlogStatus);
router.put('/customers/:id/request', approveRejectCustomerRequest);

module.exports = router;


