import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('Email dan password harus diisi')
      return
    }

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      // Error already set in store
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white p-3 rounded-lg mb-4">
            <h1 className="text-3xl font-bold">POS</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Point of Sale</h2>
          <p className="text-gray-600 text-sm mt-2">Offline & Online Sync System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Messages */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <span className="text-red-700 text-sm">{error || localError}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Sedang login...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center text-gray-600">
          <span>Belum punya akun? </span>
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Daftar di sini
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials</p>
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 space-y-1">
            <div><strong>Kasir:</strong> kasir@pos.local / password</div>
            <div><strong>Admin:</strong> admin@pos.local / password</div>
          </div>
        </div>
      </div>
    </div>
  )
}
