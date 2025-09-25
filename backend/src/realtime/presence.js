const jwt = require('jsonwebtoken');
const User = require('../models/User');

function setupPresence(io) {
	io.use((socket, next) => {
		try {
			const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.replace('Bearer ', '');
			if (!token) return next(new Error('Unauthorized'));
			const payload = jwt.verify(token, process.env.JWT_SECRET);
			socket.user = { id: payload.id, role: payload.role };
			return next();
		} catch (err) {
			return next(new Error('Unauthorized'));
		}
	});

	io.on('connection', async (socket) => {
		try {
			await User.findByIdAndUpdate(socket.user.id, { status: 'online', lastActive: new Date() });
			io.emit('presence:update', { userId: socket.user.id, status: 'online', lastActive: new Date().toISOString() });
		} catch {}

		socket.on('disconnect', async () => {
			try {
				const lastActive = new Date();
				await User.findByIdAndUpdate(socket.user.id, { status: 'offline', lastActive });
				io.emit('presence:update', { userId: socket.user.id, status: 'offline', lastActive: lastActive.toISOString() });
			} catch {}
		});
	});
}

module.exports = { setupPresence };


