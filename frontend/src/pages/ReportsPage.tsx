import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatting'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      let response: any = null

      switch (reportType) {
        case 'sales':
          response = await api.getSalesReport(startDate, endDate)
          setData(response.data.data.sales || [])
          break
        case 'profit':
          response = await api.getProfitReport(startDate, endDate)
          setSummary(response.data.data.profit || {})
          setData([])
          break
        case 'top-products':
          response = await api.getTopProducts(startDate, endDate)
          setData(response.data.data.products || [])
          break
        case 'cashier':
          response = await api.getCashierReport(startDate, endDate)
          setData(response.data.data.cashiers || [])
          break
        case 'category':
          response = await api.getCategoryReport(startDate, endDate)
          setData(response.data.data.categories || [])
          break
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportType])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laporan</h1>
        <p className="text-gray-600 dark:text-gray-400">Analisis penjualan dan kinerja</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Tipe Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="sales">Penjualan</option>
              <option value="profit">Laba Rugi</option>
              <option value="top-products">Produk Terlaris</option>
              <option value="cashier">Per Kasir</option>
              <option value="category">Per Kategori</option>
            </select>
          </div>

          <div>
            <label className="label">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="btn-primary w-full"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="card">
          {reportType === 'profit' && summary ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Ringkasan Laba Rugi</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.total_revenue)}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Biaya</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_cost)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Laba Kotor</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.gross_profit)}</p>
                </div>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data untuk ditampilkan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {reportType === 'sales' && (
                      <>
                        <th className="text-left p-3">Tanggal</th>
                        <th className="text-right p-3">Transaksi</th>
                        <th className="text-right p-3">Total Penjualan</th>
                        <th className="text-right p-3">Diskon</th>
                        <th className="text-right p-3">Rata-rata</th>
                      </>
                    )}
                    {reportType === 'top-products' && (
                      <>
                        <th className="text-left p-3">Produk</th>
                        <th className="text-right p-3">Terjual</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-right p-3">Transaksi</th>
                      </>
                    )}
                    {reportType === 'cashier' && (
                      <>
                        <th className="text-left p-3">Kasir</th>
                        <th className="text-right p-3">Transaksi</th>
                        <th className="text-right p-3">Total Penjualan</th>
                        <th className="text-right p-3">Rata-rata</th>
                      </>
                    )}
                    {reportType === 'category' && (
                      <>
                        <th className="text-left p-3">Kategori</th>
                        <th className="text-right p-3">Terjual</th>
                        <th className="text-right p-3">Total Penjualan</th>
                        <th className="text-right p-3">Transaksi</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      {reportType === 'sales' && (
                        <>
                          <td className="p-3">{formatDate(row.date)}</td>
                          <td className="p-3 text-right">{row.transaction_count}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(row.total_sales)}</td>
                          <td className="p-3 text-right text-red-600">{formatCurrency(row.total_discount)}</td>
                          <td className="p-3 text-right">{formatCurrency(row.avg_transaction)}</td>
                        </>
                      )}
                      {reportType === 'top-products' && (
                        <>
                          <td className="p-3 font-medium">{row.name}</td>
                          <td className="p-3 text-right">{row.total_quantity}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(row.total_sales)}</td>
                          <td className="p-3 text-right">{row.transaction_count}</td>
                        </>
                      )}
                      {reportType === 'cashier' && (
                        <>
                          <td className="p-3 font-medium">{row.name}</td>
                          <td className="p-3 text-right">{row.transaction_count}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(row.total_sales)}</td>
                          <td className="p-3 text-right">{formatCurrency(row.avg_transaction)}</td>
                        </>
                      )}
                      {reportType === 'category' && (
                        <>
                          <td className="p-3 font-medium">{row.category}</td>
                          <td className="p-3 text-right">{row.total_quantity}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(row.total_sales)}</td>
                          <td className="p-3 text-right">{row.transaction_count}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
