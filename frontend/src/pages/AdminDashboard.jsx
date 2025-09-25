import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import AdminCustomers from './AdminCustomers'
import AdminBlogs from './AdminBlogs'
import { disconnectSocket } from '../lib/socket'

export default function AdminDashboard() {
  const navigate = useNavigate()
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    disconnectSocket()
    navigate('/login')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">👑</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Admin Dashboard</h2>
                <p className="text-sm text-slate-600">Manage customers and blog content</p>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/40 p-2 mb-6">
          <nav className="flex gap-1 flex-wrap">
            <Tab to="/admin/customers">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Customers
            </Tab>
            <Tab to="/admin/blogs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blogs
            </Tab>
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/40 p-4 sm:p-6">
          <Routes>
            <Route index element={<Navigate to="customers" replace />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="blogs" element={<AdminBlogs />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function Tab({ to, children }) {
  return (
    <NavLink 
      to={to} 
      end 
      className={({ isActive }) => 
        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`
      }
    >
      {children}
    </NavLink>
  )
}