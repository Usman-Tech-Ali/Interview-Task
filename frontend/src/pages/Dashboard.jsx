import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  }, [])
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Welcome {user?.name || ''}</h2>
      <p className="text-sm text-gray-600">You are logged in as <span className="font-medium">{user?.role}</span></p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/profile" className="block bg-white p-4 rounded shadow hover:shadow-md transition">
          <div className="font-semibold mb-1">Profile</div>
          <div className="text-sm text-gray-600">View and update your profile.</div>
        </Link>
        <Link to="/services" className="block bg-white p-4 rounded shadow hover:shadow-md transition">
          <div className="font-semibold mb-1">Services</div>
          <div className="text-sm text-gray-600">See your active and pending services.</div>
        </Link>
        <Link to="/blogs" className="block bg-white p-4 rounded shadow hover:shadow-md transition">
          <div className="font-semibold mb-1">My Blogs</div>
          <div className="text-sm text-gray-600">Create, edit, and manage your blogs.</div>
        </Link>
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/customers" className="block bg-white p-4 rounded shadow hover:shadow-md transition">
              <div className="font-semibold mb-1">Customers</div>
              <div className="text-sm text-gray-600">Live presence, search, and details.</div>
            </Link>
            <Link to="/admin/blogs" className="block bg-white p-4 rounded shadow hover:shadow-md transition">
              <div className="font-semibold mb-1">Blogs Moderation</div>
              <div className="text-sm text-gray-600">Approve or reject customer blogs.</div>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}


