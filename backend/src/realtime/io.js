let ioInstance = null;

function initIO(httpServer, options = {}) {
	const { Server } = require('socket.io');
	ioInstance = new Server(httpServer, {
		cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
		...options
	});
	return ioInstance;
}

function getIO() {
	if (!ioInstance) throw new Error('Socket.IO has not been initialized');
	return ioInstance;
}

module.exports = { initIO, getIO };


