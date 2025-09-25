import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getSocket, refreshSocketAuth, disconnectSocket } from '../lib/socket'

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token')
  // Initialize socket for authenticated areas and keep auth fresh
  useEffect(() => {
    if (!token) return
    const socket = getSocket()
    refreshSocketAuth()
    return () => {
      // Do not disconnect on every route change if still authenticated
      // Leave socket alive; cleanup is handled on logout elsewhere
    }
  }, [token])
  if (!token) return <Navigate to="/login" replace />
  if (role) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role !== role) {
        const redirect = user.role === 'admin' ? '/admin' : '/customer'
        return <Navigate to={redirect} replace />
      }
    } catch {}
  }
  return children
}


