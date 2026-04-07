const mongoose = require('mongoose');

async function connectDB() {
	const mongoUri = process.env.MONGO_URI;

	if (!mongoUri) {
		throw new Error('MONGO_URI is not set in environment');
	}

	mongoose.set('strictQuery', true);

	await mongoose.connect(mongoUri, {
		autoIndex: process.env.NODE_ENV !== 'production',
	});

	return mongoose.connection;
}

module.exports = { connectDB };
