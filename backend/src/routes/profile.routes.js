const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { touchLastActive } = require('../middleware/activity');
const { getMe, updateMe } = require('../controllers/profile.controller');

router.use(authenticate, touchLastActive);
router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;


