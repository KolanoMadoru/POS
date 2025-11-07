import { useState, useEffect } from 'react'
import { useProductStore } from '../store/productStore'
import { formatCurrency } from '../utils/formatting'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

export default function ProductsPage() {
  const { products, fetchProducts, isLoading, createProduct, updateProduct, deleteProduct } = useProductStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Uncategorized',
    description: '',
    price_buy: 0,
    price_sell: 0,
    unit: 'pcs',
    stock: 0,
    min_stock: 0
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(editingId, formData)
      } else {
        await createProduct(formData)
      }
      setIsFormOpen(false)
      setEditingId(null)
      setFormData({
        sku: '',
        name: '',
        category: 'Uncategorized',
        description: '',
        price_buy: 0,
        price_sell: 0,
        unit: 'pcs',
        stock: 0,
        min_stock: 0
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (product: any) => {
    setFormData(product)
    setEditingId(product.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Hapus produk ini?')) {
      await deleteProduct(id)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produk</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola daftar produk</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada produk
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3">SKU</th>
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">Kategori</th>
                <th className="text-right p-3">Harga Beli</th>
                <th className="text-right p-3">Harga Jual</th>
                <th className="text-right p-3">Stok</th>
                <th className="text-center p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3 font-mono text-xs">{product.sku}</td>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3 text-sm">{product.category}</td>
                  <td className="p-3 text-right">{formatCurrency(product.price_buy)}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(product.price_sell)}</td>
                  <td className="p-3 text-right">
                    <span className={product.stock <= product.min_stock ? 'text-red-600' : ''}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleEdit(product)}
                      className="inline-block p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-block p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? 'Edit Produk' : 'Tambah Produk'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Nama Produk</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Kategori</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Satuan</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="input-field"
                    >
                      <option>pcs</option>
                      <option>box</option>
                      <option>pack</option>
                      <option>kg</option>
                      <option>liter</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Harga Beli</label>
                    <input
                      type="number"
                      value={formData.price_buy}
                      onChange={(e) => setFormData({ ...formData, price_buy: parseFloat(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Harga Jual</label>
                    <input
                      type="number"
                      value={formData.price_sell}
                      onChange={(e) => setFormData({ ...formData, price_sell: parseFloat(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Stok</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Min. Stok</label>
                    <input
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingId(null)
                    }}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
