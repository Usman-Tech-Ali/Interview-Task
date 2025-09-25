import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import CustomerDashboard from './pages/CustomerDashboard'

// function RootRedirect() {
//   const token = localStorage.getItem('token')
//   if (!token) return <Navigate to="/login" replace />
//   try {
//     const user = JSON.parse(localStorage.getItem('user') || '{}')
//     return <Navigate to={user.role === 'admin' ? '/admin' : '/customer'} replace />
//   } catch {
//     return <Navigate to="/login" replace />
//   }
// }

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/customer/*" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
