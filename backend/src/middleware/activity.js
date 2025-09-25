const User = require('../models/User');
const { getIO } = require('../realtime/io');

async function touchLastActive(req, res, next) {
	if (!req.user) return next();
	try {
		const lastActive = new Date();
		await User.findByIdAndUpdate(req.user.id, { lastActive, status: 'online' });
		try {
			getIO().emit('presence:update', { userId: req.user.id, status: 'online', lastActive: lastActive.toISOString() });
		} catch {}
	} catch {}
	return next();
}

module.exports = { touchLastActive };


