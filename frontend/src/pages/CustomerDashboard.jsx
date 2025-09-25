import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import Profile from './Profile'
import Services from './Services'
import Blogs from './Blogs'
import { disconnectSocket } from '../lib/socket'

export default function CustomerDashboard() {
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
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏠</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Customer Dashboard</h2>
                <p className="text-sm text-slate-600">Manage your profile, services, and content</p>
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
            <Tab to="/customer/profile">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Tab>
            <Tab to="/customer/services">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Services
            </Tab>
            <Tab to="/customer/blogs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Blogs
            </Tab>
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/40 p-4 sm:p-6">
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="services" element={<Services />} />
            <Route path="blogs" element={<Blogs />} />
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
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`
      }
    >
      {children}
    </NavLink>
  )
}