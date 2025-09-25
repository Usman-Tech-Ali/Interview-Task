import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useEffect as useSocketEffect } from 'react'
import { getSocket } from '../lib/socket'

const STATUS_OPTIONS = ['approved', 'rejected', 'pending'] 

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/blogs')
      setBlogs(data.blogs || [])
    } catch (err) {
      console.error('Failed to load blogs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Live updates via socket
  useSocketEffect(() => {
    const socket = getSocket()
    const onCreated = ({ blog }) => {
      setBlogs(prev => {
        const exists = prev.some(b => b._id === blog._id)
        if (exists) return prev
        return [blog, ...prev]
      })
    }
    const onUpdated = ({ blog }) => {
      setBlogs(prev => prev.map(b => b._id === blog._id ? blog : b))
    }
    const onDeleted = ({ blogId }) => {
      setBlogs(prev => prev.filter(b => b._id !== blogId))
    }
    const onStatus = ({ blog }) => {
      setBlogs(prev => prev.map(b => b._id === blog._id ? blog : b))
    }
    const onOwnerDeletedBlogs = ({ ownerId }) => {
      setBlogs(prev => prev.filter(b => (b.userId && b.userId._id ? b.userId._id !== ownerId : b.userId !== ownerId)))
    }
    socket.on('blog:created', onCreated)
    socket.on('blog:updated', onUpdated)
    socket.on('blog:deleted', onDeleted)
    socket.on('blog:status', onStatus)
    socket.on('blog:deleted:byOwner', onOwnerDeletedBlogs)
    return () => {
      socket.off('blog:created', onCreated)
      socket.off('blog:updated', onUpdated)
      socket.off('blog:deleted', onDeleted)
      socket.off('blog:status', onStatus)
      socket.off('blog:deleted:byOwner', onOwnerDeletedBlogs)
    }
  }, [])

  async function updateStatus(id, newStatus) {
    setUpdatingId(id)
    try {
      const { data } = await api.put(`/admin/blogs/${id}/status`, { status: newStatus })
      setBlogs(prev =>
        prev.map(b => b._id === id ? { ...b, status: data.blog?.status || newStatus } : b)
      )
    } catch (err) {
      console.error('Update failed:', err.response?.data || err.message)
      alert(`Unable to update: ${err.response?.data?.message || err.message}`)
    } finally {
      setUpdatingId(null)
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

  function getActionButton(action) {
    const styles = {
      approved: 'text-green-700 hover:text-green-800 hover:bg-green-50',
      rejected: 'text-red-700 hover:text-red-800 hover:bg-red-50',
      pending: 'text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50'
    }
    return styles[action] || 'text-slate-700 hover:text-slate-800 hover:bg-slate-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading blogs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Blog Management</h3>
          <p className="text-sm text-slate-600">Review and moderate blog content</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-100/60 px-3 py-1 rounded-lg">
          {blogs.length} blogs
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/60">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Author</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Content</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {blogs.map(b => {
                const remainingActions = STATUS_OPTIONS.filter(s => s !== b.status)
                return (
                  <tr key={b._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 max-w-xs truncate" title={b.title}>
                        {b.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{b.userId?.name || 'Unknown'}</div>
                        <div className="text-sm text-slate-500">{b.userId?.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-sm text-slate-600 line-clamp-2" title={b.content}>
                        {b.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {remainingActions.map(action => {
                          const label = action === 'approved' ? 'Approve' 
                                      : action === 'rejected' ? 'Reject' 
                                      : 'Set Pending'
                          
                          return (
                            <button
                              key={action}
                              onClick={() => updateStatus(b._id, action)}
                              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${getActionButton(action)}`}
                              disabled={updatingId === b._id}
                              title={`Set status to ${action}`}
                            >
                              {label}
                            </button>
                          )
                        })}
                        {updatingId === b._id && (
                          <div className="flex items-center gap-1 px-2 py-1">
                            <div className="w-3 h-3 border-2 border-slate-300/20 border-t-slate-500 rounded-full animate-spin"></div>
                            <span className="text-xs text-slate-500">Updating...</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {blogs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No blogs found</h3>
            <p className="text-slate-500">Blog posts will appear here as users create them</p>
          </div>
        )}
      </div>
    </div>
  )
}