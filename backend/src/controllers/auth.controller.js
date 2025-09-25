const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signJwt } = require('../middleware/auth');
const { getIO } = require('../realtime/io');

async function signup(req, res) {
	try {
		const { name, email, password, role, subscriptionPlan } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required' });
		}

		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ message: 'Email already in use' });

		const hashed = await bcrypt.hash(password, 10);
		const user = await User.create({
			name,
			email,
			password: hashed,
			role: role === 'admin' ? 'admin' : 'customer',
			subscriptionPlan: subscriptionPlan || null,
			lastActive: new Date(),
			status: 'online'
		});

		const token = signJwt({ id: user._id, role: user.role });
		try {
			getIO().emit('presence:update', { userId: user._id.toString(), status: 'online', lastActive: user.lastActive.toISOString() });
		} catch {}
		return res.status(201).json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				subscriptionPlan: user.subscriptionPlan,
				lastActive: user.lastActive,
				status: user.status
			},
			token
		});
	} catch (err) {
		return res.status(500).json({ message: 'Signup failed', error: err.message });
	}
}

async function login(req, res) {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

		user.lastActive = new Date();
		user.status = 'online';
		await user.save();

		const token = signJwt({ id: user._id, role: user.role });
		try {
			getIO().emit('presence:update', { userId: user._id.toString(), status: 'online', lastActive: user.lastActive.toISOString() });
		} catch {}
		return res.status(200).json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				subscriptionPlan: user.subscriptionPlan,
				lastActive: user.lastActive,
				status: user.status
			},
			token
		});
	} catch (err) {
		return res.status(500).json({ message: 'Login failed', error: err.message });
	}
}

module.exports = { signup, login };

