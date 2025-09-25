require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectToDatabase } = require('./config/db');
const { initIO } = require('./realtime/io');
const { setupPresence } = require('./realtime/presence');

const PORT = process.env.PORT || 4000;

(async () => {
	try {
		await connectToDatabase();
		console.log('MongoDB connected');
		const server = http.createServer(app);
		const io = initIO(server);
		setupPresence(io);
		server.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`);
		});
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
})();

