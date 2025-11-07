import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useSyncStore } from '../store/syncStore'
import { SyncStatus as SyncStatusType } from '../types'

interface SyncStatusProps {
  isOnline: boolean
  status: SyncStatusType
}

export default function SyncStatus({ isOnline, status }: SyncStatusProps) {
  const { isSyncing, sync, error, lastSyncTime } = useSyncStore()
  const [showDetails, setShowDetails] = useState(false)

  const totalUnsynced = status.unsynced_products +
    status.unsynced_transactions +
    status.unsynced_stock_history

  const handleSync = async () => {
    await sync()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        title="Sync status"
      >
        <RefreshCw
          size={20}
          className={isSyncing ? 'animate-spin' : ''}
        />
        {totalUnsynced > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnsynced}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDetails && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Sync Status</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>
          </div>

          {/* Status Info */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Koneksi:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {isOnline && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Produk belum sinkron:</span>
                  <span>{status.unsynced_products}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transaksi belum sinkron:</span>
                  <span>{status.unsynced_transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Stok belum sinkron:</span>
                  <span>{status.unsynced_stock_history}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Antrian pending:</span>
                  <span>{status.pending_queue}</span>
                </div>

                {lastSyncTime && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Sinkron terakhir: {new Date(lastSyncTime).toLocaleTimeString('id-ID')}
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-600 dark:text-red-400 text-xs">{error}</span>
              </div>
            )}
          </div>

          {/* Sync Button */}
          {isOnline && totalUnsynced > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full btn-primary text-sm disabled:opacity-50"
            >
              {isSyncing ? 'Menyinkron...' : 'Sinkron Sekarang'}
            </button>
          )}

          {!isOnline && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Anda sedang offline. Data akan sinkron otomatis saat online.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
