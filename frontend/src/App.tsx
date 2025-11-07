import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useSyncStore } from './store/syncStore'
import { useProductStore } from './store/productStore'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import POSPage from './pages/POSPage'
import ProductsPage from './pages/ProductsPage'
import TransactionsPage from './pages/TransactionsPage'
import StockPage from './pages/StockPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'

// Components
import Layout from './components/Layout'

function App() {
  const { user, getStoredUser } = useAuthStore()
  const { getSyncStatus, sync } = useSyncStore()
  const { fetchProducts } = useProductStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      await getStoredUser()
      if (user) {
        await fetchProducts()
        await getSyncStatus()
      }
      setInitialized(true)
    }

    init()
  }, [])

  // Setup online/offline listeners
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Online!')
      await sync()
    }

    const handleOffline = () => {
      console.log('Offline!')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto sync every 5 minutes when online
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      if (navigator.onLine) {
        await sync()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  )
}

export default App
