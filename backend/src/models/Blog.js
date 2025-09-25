const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		content: { type: String, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true }
	},
	{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Blog', BlogSchema);


