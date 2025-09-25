import { useEffect, useState } from 'react'
import api from '../lib/api'
import { getSocket } from '../lib/socket'
import { useEffect as useSocketEffect } from 'react'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/blogs/my')
      setBlogs(data.blogs)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Listen for status changes emitted by admin and deletions
  useSocketEffect(() => {
    const socket = getSocket()
    const onUpdated = ({ blog }) => {
      setBlogs(prev => prev.map(b => b._id === blog._id ? blog : b))
    }
    const onDeleted = ({ blogId, ownerId }) => {
      setBlogs(prev => prev.filter(b => b._id !== blogId))
    }
    const onStatus = ({ blog }) => {
      setBlogs(prev => prev.map(b => b._id === blog._id ? blog : b))
    }
    const onOwnerDeletedBlogs = ({ ownerId }) => {
      setBlogs(prev => prev.filter(b => (b.userId && b.userId._id ? b.userId._id !== ownerId : b.userId !== ownerId)))
    }
    socket.on('blog:updated', onUpdated)
    socket.on('blog:status', onStatus)
    socket.on('blog:deleted', onDeleted)
    socket.on('blog:deleted:byOwner', onOwnerDeletedBlogs)
    return () => {
      socket.off('blog:updated', onUpdated)
      socket.off('blog:status', onStatus)
      socket.off('blog:deleted', onDeleted)
      socket.off('blog:deleted:byOwner', onOwnerDeletedBlogs)
    }
  }, [])

  async function createBlog(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    
    setCreating(true)
    setError('')
    try {
      const { data } = await api.post('/blogs', { title: title.trim(), content: content.trim() })
      setBlogs([data.blog, ...blogs])
      setTitle('')
      setContent('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create blog')
    } finally {
      setCreating(false)
    }
  }

  async function updateBlog(id, nextTitle, nextContent) {
    if (!nextTitle.trim() || !nextContent.trim()) return
    
    try {
      const { data } = await api.put(`/blogs/${id}`, { title: nextTitle.trim(), content: nextContent.trim() })
      setBlogs(blogs.map(b => b._id === id ? data.blog : b))
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update blog')
    }
  }

  async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    
    try {
      await api.delete(`/blogs/${id}`)
      setBlogs(blogs.filter(b => b._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog')
    }
  }

  function getStatusBadge(status) {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return styles[status] || 'bg-slate-100 text-slate-800'
  }

  function getStatusIcon(status) {
    switch(status) {
      case 'approved':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading blogs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">My Blog Posts</h3>
          <p className="text-sm text-slate-600">Create and manage your blog content</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Create Blog Form */}
      <div className="bg-white/80 border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/30">
          <h4 className="text-md font-semibold text-slate-800">Create New Blog Post</h4>
        </div>
        <div className="p-6">
          <form onSubmit={createBlog} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input 
                type="text"
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter blog title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)}
                rows="6"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-vertical"
                placeholder="Write your blog content..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={creating || !title.trim() || !content.trim()}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:shadow-none"
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Blog
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="bg-white/80 border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/30 flex items-center justify-between">
          <h4 className="text-md font-semibold text-slate-800">My Blog Posts</h4>
          <div className="text-sm text-slate-500 bg-slate-100/60 px-3 py-1 rounded-lg">
            {blogs.length} posts
          </div>
        </div>

        {blogs.length > 0 ? (
          <div className="divide-y divide-slate-200/60">
            {blogs.map(blog => (
              <div key={blog._id} className="p-6 hover:bg-slate-50/40 transition-colors duration-150">
                <div className="space-y-4">
                  {/* Blog Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(blog.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(blog.status)}`}>
                        {blog.status}
                      </span>
                      <span className="text-sm text-slate-500">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(editingId === blog._id ? null : blog._id)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        title={editingId === blog._id ? "Cancel editing" : "Edit blog"}
                      >
                        {editingId === blog._id ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => deleteBlog(blog._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete blog"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Blog Content */}
                  {editingId === blog._id ? (
                    <BlogEditForm
                      blog={blog}
                      onSave={(title, content) => updateBlog(blog._id, title, content)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="space-y-3">
                      <h5 className="text-lg font-medium text-slate-900">{blog.title}</h5>
                      <p className="text-slate-600 leading-relaxed">{blog.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No blog posts yet</h3>
            <p className="text-slate-500">Start writing your first blog post above!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BlogEditForm({ blog, onSave, onCancel }) {
  const [editTitle, setEditTitle] = useState(blog.title)
  const [editContent, setEditContent] = useState(blog.content)
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (!editTitle.trim() || !editContent.trim()) return
    
    setSaving(true)
    try {
      await onSave(editTitle.trim(), editContent.trim())
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <input 
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          placeholder="Blog title..."
          required
        />
      </div>
      <div>
        <textarea 
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          rows="4"
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-vertical"
          placeholder="Blog content..."
          required
        />
      </div>
      <div className="flex gap-2">
        <button 
          type="submit"
          disabled={saving || !editTitle.trim() || !editContent.trim()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors duration-200"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}