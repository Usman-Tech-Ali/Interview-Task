const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { touchLastActive } = require('../middleware/activity');
const { listServices } = require('../controllers/services.controller');

router.get('/', authenticate, authorize('customer'), touchLastActive, listServices);

module.exports = router;


