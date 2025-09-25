import { Link } from 'react-router-dom'

export default function AuthLayout({ children, active }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-slate-800 text-lg">Blog Management</span>
            </div>
            <nav className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-1">
              <Link 
                to="/login" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  active === 'login' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  active === 'signup' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                Sign up
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}