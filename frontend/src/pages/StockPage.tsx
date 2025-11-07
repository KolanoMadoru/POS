import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useProductStore } from '../store/productStore'
import { formatCurrency } from '../utils/formatting'
import { AlertCircle, Plus, Minus } from 'lucide-react'

export default function StockPage() {
  const { products, fetchProducts } = useProductStore()
  const [stocks, setStocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [notes, setNotes] = useState('')
  const [isStockIn, setIsStockIn] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    setIsLoading(true)
    try {
      const response = await api.getAllStock()
      if (response.data.data) {
        setStocks(response.data.data.stocks)
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStockIn = async () => {
    if (!selectedProduct || quantity <= 0) {
      alert('Pilih produk dan jumlah')
      return
    }

    try {
      await api.stockIn(selectedProduct, quantity, notes)
      setQuantity(0)
      setNotes('')
      setSelectedProduct(null)
      await fetchStocks()
    } catch (error) {
      alert('Gagal menambah stok')
    }
  }

  const handleStockOut = async () => {
    if (!selectedProduct || quantity <= 0) {
      alert('Pilih produk dan jumlah')
      return
    }

    try {
      await api.stockOut(selectedProduct, quantity, notes)
      setQuantity(0)
      setNotes('')
      setSelectedProduct(null)
      await fetchStocks()
    } catch (error) {
      alert('Gagal mengurangi stok')
    }
  }

  const lowStockItems = stocks.filter(s => s.low_stock)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stok & Inventori</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola stok produk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Operations */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Operasi Stok</h2>

            <div className="space-y-4">
              {/* Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsStockIn(true)}
                  className={`flex-1 py-2 rounded font-medium transition ${
                    isStockIn ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Plus size={16} className="inline mr-1" /> In
                </button>
                <button
                  onClick={() => setIsStockIn(false)}
                  className={`flex-1 py-2 rounded font-medium transition ${
                    !isStockIn ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Minus size={16} className="inline mr-1" /> Out
                </button>
              </div>

              {/* Product Select */}
              <div>
                <label className="label">Produk</label>
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="label">Jumlah</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="1"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="label">Catatan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Alasan perubahan stok..."
                />
              </div>

              {/* Submit */}
              <button
                onClick={isStockIn ? handleStockIn : handleStockOut}
                className={isStockIn ? 'btn-success w-full' : 'btn-danger w-full'}
              >
                {isStockIn ? 'Stok In' : 'Stok Out'}
              </button>
            </div>
          </div>
        </div>

        {/* Stock List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Alert */}
          {lowStockItems.length > 0 && (
            <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Stok Menipis
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {lowStockItems.length} produk memiliki stok kurang dari minimum
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stock Table */}
          <div className="card overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : stocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada produk
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3">Produk</th>
                    <th className="text-center p-3">Stok</th>
                    <th className="text-center p-3">Min</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock => (
                    <tr
                      key={stock.id}
                      className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        stock.low_stock ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{stock.name}</p>
                          <p className="text-xs text-gray-500">{stock.sku}</p>
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {stock.current_stock} {stock.unit}
                      </td>
                      <td className="p-3 text-center text-sm">
                        {stock.min_stock} {stock.unit}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          stock.low_stock
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {stock.low_stock ? '⚠️ Menipis' : '✓ Aman'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
