const mongoose = require('mongoose');

async function connectToDatabase() {
	const uri = process.env.MONGO_URI;
	if (!uri) throw new Error('MONGO_URI not set');
	await mongoose.connect(uri, {
		serverSelectionTimeoutMS: 10000
	});
	return mongoose.connection;
}

module.exports = { connectToDatabase };

