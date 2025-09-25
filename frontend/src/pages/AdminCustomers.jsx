import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { getSocket } from '../lib/socket'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const token = useMemo(() => localStorage.getItem('token') || '', [])

  useEffect(() => {
    const socket = getSocket()
    const handler = ({ userId, status, lastActive }) => {
      setCustomers(list => list.map(c => c._id === userId ? { ...c, status, lastActive } : c))
    }
    const onProfileUpdate = ({ userId, name, subscriptionPlan }) => {
      setCustomers(list => list.map(c => c._id === userId ? { ...c, name: name ?? c.name, subscriptionPlan: subscriptionPlan ?? c.subscriptionPlan } : c))
    }
    socket.on('presence:update', handler)
    socket.on('profile:update', onProfileUpdate)
    return () => {
      socket.off('presence:update', handler)
      socket.off('profile:update', onProfileUpdate)
    }
  }, [token])

  async function load() {
    setLoading(true)
    const params = {}
    if (q) params.q = q
    if (status) params.status = status
    try {
      const { data } = await api.get('/admin/customers', { params })
      setCustomers(data.customers)
    } catch (err) {
      console.error('Failed to load customers', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function dummyApprove(id, action) {
    try {
      await api.put(`/admin/customers/${id}/request`, { action })
      setCustomers(list => list.map(c => c._id === id ? { ...c, _lastAction: action } : c))
    } catch (err) {
      console.error('Action failed:', err)
    }
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '-'
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    const d = new Date(dateStr)
    return `Today at ${d.toLocaleTimeString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Customer Management</h3>
          <p className="text-sm text-slate-600">Monitor and manage customer accounts</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-100/60 px-3 py-1 rounded-lg">
          {customers.length} customers
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
        <div className="flex-1">
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            placeholder="Search by name or email..." 
          />
        </div>
        <div className="relative">
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer pr-10"
          >
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button 
          onClick={load}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Searching...
            </div>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/60">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Last Active</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {customers.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {u.subscriptionPlan || 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      <span className={`text-sm font-medium capitalize ${u.status === 'online' ? 'text-green-700' : 'text-slate-500'}`}>
                        {u.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {timeAgo(u.lastActive)}
                  </td>
                  <td className="px-6 py-4">
                    {!u._lastAction ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => dummyApprove(u._id, 'approve')} 
                          className="px-3 py-1 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors duration-200"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => dummyApprove(u._id, 'reject')} 
                          className="px-3 py-1 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        u._lastAction === 'approve' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {u._lastAction === 'approve' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {customers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No customers found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}