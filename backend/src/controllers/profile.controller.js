const User = require('../models/User');

async function getMe(req, res) {
	try {
		const user = await User.findById(req.user.id).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found' });
		return res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
	}
}

async function updateMe(req, res) {
	try {
		const { name, subscriptionPlan } = req.body;
		const updates = {};
		if (name !== undefined) updates.name = name;
		if (subscriptionPlan !== undefined) updates.subscriptionPlan = subscriptionPlan;
		updates.lastActive = new Date();
		updates.status = 'online';
		const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found' });
		try { require('../realtime/io').getIO().emit('profile:update', { userId: user._id.toString(), name: user.name, subscriptionPlan: user.subscriptionPlan }); } catch {}
		return res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to update profile', error: err.message });
	}
}

module.exports = { getMe, updateMe };


