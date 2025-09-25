const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['admin', 'customer'], default: 'customer', index: true },
		subscriptionPlan: { type: String, default: null },
		lastActive: { type: Date, default: null },
		status: { type: String, enum: ['online', 'offline'], default: 'offline', index: true }
	},
	{ timestamps: true }
);
























UserSchema.pre('findOneAndDelete', async function(next) {
	try {
		const docToDelete = await this.model.findOne(this.getFilter()).select('_id');
		if (docToDelete) {
			const Blog = require('./Blog');
			await Blog.deleteMany({ userId: docToDelete._id });
			try { require('../realtime/io').getIO().emit('blog:deleted:byOwner', { ownerId: docToDelete._id.toString() }); } catch {}
		}
		return next();
	} catch (err) {
		return next(err);
	}
});

UserSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
	try {
		const Blog = require('./Blog');
		await Blog.deleteMany({ userId: this._id });
		try { require('../realtime/io').getIO().emit('blog:deleted:byOwner', { ownerId: this._id.toString() }); } catch {}
		return next();
	} catch (err) {
		return next(err);
	}
});

module.exports = mongoose.model('User', UserSchema);

