const Blog = require('../models/Blog');
const { getIO } = require('../realtime/io');

async function createBlog(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const blog = await Blog.create({ title, content, userId: req.user.id });
    const populated = await Blog.findById(blog._id).populate('userId', 'name email');

    try {
      getIO().emit('blog:created', { blog: populated });
    } catch {}

    return res.status(201).json({ blog: populated });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create blog', error: err.message });
  }
}

async function listMyBlogs(req, res) {
  try {
    const blogs = await Blog.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch blogs', error: err.message });
  }
}

async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const blog = await Blog.findOne({ _id: id, userId: req.user.id });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    blog.status = 'pending'; // reset to pending on edit

    await blog.save();
    const populated = await Blog.findById(blog._id).populate('userId', 'name email');

    try {
      getIO().emit('blog:updated', { blog: populated });
    } catch {}

    return res.status(200).json({ blog: populated });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update blog', error: err.message });
  }
}

async function deleteBlog(req, res) {
  try {
    const { id } = req.params;

    const blog = await Blog.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    try {
      getIO().emit('blog:deleted', { blogId: id, ownerId: req.user.id });
    } catch {}

    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete blog', error: err.message });
  }
}

async function updateBlogStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const blog = await Blog.findByIdAndUpdate(id, { status }, { new: true }).populate('userId', 'name email');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    try {
      getIO().emit('blog:status', { blog });
    } catch {}

    return res.status(200).json({ blog });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update blog status', error: err.message });
  }
}

module.exports = {
  createBlog,
  listMyBlogs,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
};
