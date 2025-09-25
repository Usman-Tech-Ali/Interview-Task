import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'

export default function NavBar() {
  const navigate = useNavigate()
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  }, [])
  const token = localStorage.getItem('token')

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <Link to="/" className="font-semibold">Blog Management</Link>
      <div className="space-x-3">
        {!token && (<>
          <Link className="text-blue-600" to="/login">Login</Link>
          <Link className="text-blue-600" to="/signup">Signup</Link>
        </>)}
        {token && (<>
          <Link className="text-blue-600" to="/dashboard">Dashboard</Link>
          <Link className="text-blue-600" to="/profile">Profile</Link>
          <Link className="text-blue-600" to="/services">Services</Link>
          <Link className="text-blue-600" to="/blogs">Blogs</Link>
          {user?.role === 'admin' && (<>
            <Link className="text-blue-600" to="/admin/customers">Customers</Link>
            <Link className="text-blue-600" to="/admin/blogs">Blogs Moderation</Link>
          </>)}
          <button onClick={logout} className="text-red-600">Logout</button>
        </>)}
      </div>
    </nav>
  )
}


