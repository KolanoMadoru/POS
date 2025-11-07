import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: ''
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!formData.email || !formData.password || !formData.name) {
      setLocalError('Email, password, dan nama harus diisi')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password minimal 6 karakter')
      return
    }

    try {
      await register(formData.email, formData.password, formData.name)
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
          <h2 className="text-2xl font-bold text-gray-900">Daftar</h2>
          <p className="text-gray-600 text-sm mt-2">Buat akun baru untuk POS System</p>
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

          {/* Name */}
          <div>
            <label className="label">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Nama Anda"
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">Nomor Telepon (Opsional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="0812XXXXXXXX"
              disabled={isLoading}
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">Alamat (Opsional)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              placeholder="Alamat Anda"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {isLoading ? 'Sedang mendaftar...' : 'Daftar'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-gray-600">
          <span>Sudah punya akun? </span>
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
