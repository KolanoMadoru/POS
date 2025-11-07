import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'
import { useProductStore } from '../store/productStore'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import { db } from '../db/database'
import { formatCurrency } from '../utils/formatting'
import { printStruk, shareWhatsApp } from '../utils/struk'
import { Plus, Minus, Trash2, Printer, MessageCircle } from 'lucide-react'

export default function POSPage() {
  const { products, fetchProducts } = useProductStore()
  const {
    items,
    subtotal,
    discount,
    tax,
    total,
    addItem,
    removeItem,
    updateItemQuantity,
    setDiscount,
    setTax,
    setPaymentMethod,
    getChange,
    calculateTotals,
    clear
  } = useCartStore()
  const { user } = useAuthStore()
  const [amountPaid, setAmountPaid] = useState(0)
  const [paymentMethod, setPaymentMethodLocal] = useState('cash')
  const [isLoading, setIsLoading] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxPercent, setTaxPercent] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastTransaction, setLastTransaction] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddItem = (product: any) => {
    addItem(product, 1)
  }

  const handleApplyDiscount = () => {
    setDiscount(undefined, discountPercent)
  }

  const handleApplyTax = () => {
    setTax(undefined, taxPercent)
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Keranjang kosong')
      return
    }

    if (amountPaid < total) {
      alert('Uang yang dibayarkan kurang')
      return
    }

    setIsLoading(true)
    try {
      const transactionData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          discount_value: item.discount_value || 0,
          discount_percent: item.discount_percent || 0,
          subtotal: item.subtotal
        })),
        subtotal,
        discount_value: discount.value,
        discount_percent: discount.percent,
        tax_value: tax.value,
        tax_percent: tax.percent,
        amount_paid: amountPaid,
        payment_method: paymentMethod,
        total
      }

      const response = await api.createTransaction(transactionData)

      if (response.data.data) {
        const transaction = response.data.data.transaction
        setLastTransaction(transaction)
        
        // Save to local DB
        await db.transactions.put(transaction)
        for (const item of transaction.items) {
          await db.transactionItems.put(item)
        }

        // Print struk
        printStruk(transaction)

        // Clear cart
        clear()
        setAmountPaid(0)
        setDiscountPercent(0)
        setTaxPercent(0)
      }
    } catch (error: any) {
      console.error('Checkout failed:', error)
      if (navigator.onLine) {
        alert('Gagal membuat transaksi: ' + (error.response?.data?.message || error.message))
      } else {
        // Save offline
        const transactionData = {
          id: Date.now().toString(),
          cashier_id: user?.id || 'offline',
          items: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            discount_value: item.discount_value || 0,
            discount_percent: item.discount_percent || 0,
            subtotal: item.subtotal
          })),
          subtotal,
          discount_value: discount.value,
          discount_percent: discount.percent,
          tax_value: tax.value,
          tax_percent: tax.percent,
          amount_paid: amountPaid,
          payment_method: paymentMethod,
          total,
          created_at: new Date().toISOString(),
          synced: false
        }
        
        await db.transactions.put(transactionData)
        alert('Transaksi tersimpan offline')
        clear()
        setAmountPaid(0)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products */}
      <div className="lg:col-span-2">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Produk</h2>
          
          <input
            type="text"
            placeholder="Cari produk atau SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field mb-4"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleAddItem(product)}
                className="text-left p-3 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              >
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sku}</p>
                <p className="text-blue-600 font-bold mt-2">{formatCurrency(product.price_sell)}</p>
                <p className="text-xs text-gray-500">Stok: {product.stock}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-4">
        {/* Cart */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Keranjang</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Keranjang kosong</p>
            ) : (
              items.map(item => (
                <div key={item.product_id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount Input */}
            <div className="flex gap-2">
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                placeholder="Diskon %"
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={handleApplyDiscount}
                className="btn-secondary text-sm whitespace-nowrap"
              >
                Terapkan
              </button>
            </div>
            {discount.value > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon:</span>
                <span>-{formatCurrency(discount.value)}</span>
              </div>
            )}

            {/* Tax Input */}
            <div className="flex gap-2">
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                placeholder="Pajak %"
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={handleApplyTax}
                className="btn-secondary text-sm whitespace-nowrap"
              >
                Terapkan
              </button>
            </div>
            {tax.value > 0 && (
              <div className="flex justify-between">
                <span>Pajak:</span>
                <span>{formatCurrency(tax.value)}</span>
              </div>
            )}

            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <h3 className="font-semibold mb-3">Pembayaran</h3>

          <div className="space-y-3">
            <div>
              <label className="label">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethodLocal(e.target.value)}
                className="input-field"
              >
                <option value="cash">Tunai</option>
                <option value="debit">Debit</option>
                <option value="credit">Kredit</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="label">Uang Diterima</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="0"
              />
            </div>

            {amountPaid > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">Kembalian:</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(getChange(amountPaid))}
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading || items.length === 0}
              className="btn-success w-full disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Checkout'}
            </button>
          </div>
        </div>

        {/* Last Transaction */}
        {lastTransaction && (
          <div className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">✓ Transaksi Berhasil</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => printStruk(lastTransaction)}
                  className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
                >
                  <Printer size={14} /> Cetak
                </button>
                <button
                  onClick={() => shareWhatsApp(lastTransaction)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
