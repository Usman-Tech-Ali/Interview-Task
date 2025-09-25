const User = require('../models/User');
const Blog = require('../models/Blog');

async function approveRejectCustomerRequest(req, res) {
	try {
		const { id } = req.params;
		const { action } = req.body; // 'approve' | 'reject'
		if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
		// Dummy action: just echo back
		return res.json({ userId: id, action, status: 'ok' });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to process request', error: err.message });
	}
}

async function listCustomers(req, res) {
	try {
		const { q, status } = req.query;
		const filter = { role: 'customer' };
		if (status && ['online', 'offline'].includes(status)) {
			filter.status = status;
		}
		if (q) {
			const regex = new RegExp(q, 'i');
			filter.$or = [{ name: regex }, { email: regex }];
		}
		const customers = await User.find(filter)
			.select('name email subscriptionPlan status lastActive')
			.sort({ name: 1 });
		return res.status(200).json({ customers });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to list customers', error: err.message });
	}
}

async function listAllBlogs(req, res) {
	try {
    const blogs = await Blog.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
		return res.status(200).json({ blogs });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to list blogs', error: err.message });
	}
}

async function updateBlogStatus(req, res) {
	try {
		const { id } = req.params;
		const { status } = req.body;
		if (!['approved', 'rejected', 'pending'].includes(status)) {
			return res.status(400).json({ message: 'Invalid status' });
		}
    const blog = await Blog.findById(id);
		if (!blog) return res.status(404).json({ message: 'Blog not found' });
		blog.status = status;
    await blog.save();
    const populated = await Blog.findById(id).populate('userId', 'name email');
    try { require('../realtime/io').getIO().emit('blog:status', { blog: populated }); } catch {}
    return res.status(200).json({ blog: populated });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to update blog status', error: err.message });
	}
}

module.exports = { listCustomers, listAllBlogs, updateBlogStatus, approveRejectCustomerRequest };


