import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { db } from '../db/database'
import { formatCurrency, formatDateTime } from '../utils/formatting'
import { Eye, Printer } from 'lucide-react'
import { printStruk } from '../utils/struk'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchTransactions()
  }, [page])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      if (navigator.onLine) {
        const response = await api.getTransactions(page)
        if (response.data.data) {
          setTransactions(response.data.data.transactions)
        }
      } else {
        // Get from local DB
        const localTransactions = await db.transactions.toArray()
        setTransactions(localTransactions)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      // Fallback to local
      const localTransactions = await db.transactions.toArray()
      setTransactions(localTransactions)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (transaction: any) => {
    if (!transaction.items) {
      try {
        const response = await api.getTransaction(transaction.id)
        if (response.data.data) {
          setSelectedTransaction(response.data.data.transaction)
        }
      } catch {
        setSelectedTransaction(transaction)
      }
    } else {
      setSelectedTransaction(transaction)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaksi</h1>
        <p className="text-gray-600 dark:text-gray-400">Daftar semua transaksi penjualan</p>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada transaksi
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Tanggal</th>
                <th className="text-right p-3">Total</th>
                <th className="text-center p-3">Metode</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3 font-mono text-xs">{transaction.id.substring(0, 8)}</td>
                  <td className="p-3">{formatDateTime(transaction.created_at)}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(transaction.total)}</td>
                  <td className="p-3 text-center text-sm capitalize">{transaction.payment_method}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      transaction.synced ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.synced ? 'Sinkron' : 'Offline'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleViewDetails(transaction)}
                      className="inline-block p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Lihat detail"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => printStruk(transaction)}
                      className="inline-block p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                      title="Cetak struk"
                    >
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Detail Transaksi</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ID Transaksi</p>
                    <p className="font-mono">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal</p>
                    <p>{formatDateTime(selectedTransaction.created_at)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Item</h3>
                  <div className="space-y-2">
                    {(selectedTransaction.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.product_id} x {item.quantity}</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                  </div>
                  {selectedTransaction.discount_value > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Diskon</span>
                      <span>-{formatCurrency(selectedTransaction.discount_value)}</span>
                    </div>
                  )}
                  {selectedTransaction.tax_value > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Pajak</span>
                      <span>{formatCurrency(selectedTransaction.tax_value)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(selectedTransaction.total)}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Dibayar</span>
                    <span>{formatCurrency(selectedTransaction.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembalian</span>
                    <span className="text-green-600">{formatCurrency(selectedTransaction.change_amount)}</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="btn-secondary"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => printStruk(selectedTransaction)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Printer size={16} /> Cetak Struk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
