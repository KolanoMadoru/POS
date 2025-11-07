import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import { AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      await api.updateProfile()
      setSuccess('Profil berhasil diperbarui')
      setIsEditing(false)
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola informasi profil Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <div className="mt-4 inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {user?.role.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Informasi Profil</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary text-sm"
                >
                  Edit
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                <span className="text-green-700 dark:text-green-300 text-sm">✓ {success}</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Read-only fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={user?.email}
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input
                      type="text"
                      value={user?.role}
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed uppercase"
                      disabled
                    />
                  </div>
                </div>

                {/* Editable fields */}
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Nomor Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    rows={3}
                  />
                </div>

                {/* Password Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Ubah Password (Opsional)</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="label">Password Saat Ini</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="label">Password Baru</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="label">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nama Lengkap</p>
                  <p className="font-medium text-lg">{formData.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>

                {formData.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nomor Telepon</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                )}

                {formData.address && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alamat</p>
                    <p className="font-medium">{formData.address}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Keamanan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status Login:</span>
              <span className="text-green-600 font-medium">✓ Aktif</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">2FA:</span>
              <span className="text-gray-600 dark:text-gray-400">Tidak aktif</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Sistem</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Versi Aplikasi:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mode:</span>
              <span className="font-medium">Offline-Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
