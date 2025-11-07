import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingCart, Package, AlertCircle } from 'lucide-react'
import { api } from '../services/api'

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    total_sales: 0,
    transaction_count: 0,
    total_discount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.getTransactionSummary()
        if (response.data.data) {
          setSummary(response.data.data.summary)
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const cards = [
    {
      title: 'Total Penjualan',
      value: `Rp ${summary.total_sales.toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Transaksi',
      value: summary.transaction_count,
      icon: ShoppingCart,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Total Diskon',
      value: `Rp ${summary.total_discount.toLocaleString('id-ID')}`,
      icon: Package,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Selamat datang di POS System</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {card.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a href="/pos" className="block btn-primary text-center">
                  Mulai Transaksi
                </a>
                <a href="/products" className="block btn-secondary text-center">
                  Kelola Produk
                </a>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">System Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
