# POS Offline-Online Sync

Aplikasi Point of Sale (POS) modern dengan dukungan penuh offline dan otomatis sinkronisasi ke server ketika online.

## Fitur Utama

### 🔐 Autentikasi User
- Register, Login, Logout
- Role-based access (Admin, Kasir, Owner)
- Login offline dengan cache lokal
- Token-based authentication (JWT)

### 🛒 Transaksi POS
- Tambah/edit/hapus produk di cart
- Kalkulasi otomatis:
  - Subtotal
  - Diskon (per item & total)
  - Pajak
  - Total bayar
  - Kembalian
- Simpan transaksi offline
- Auto-sync ke server saat online
- Riwayat transaksi

### 📦 Manajemen Produk
- CRUD produk
- Field: nama, SKU/barcode, harga, stok, kategori, satuan, foto
- Tersedia offline
- Sinkronisasi stok real-time

### 📊 Stok & Inventori
- Stock In/Out
- Riwayat perubahan stok
- Alert minimum stok
- Penyesuaian stok manual

### 🧾 Struk
- Cetak thermal printer
- Export PDF
- Share WhatsApp
- Template struk yang dapat dikustomisasi

### 📈 Laporan
- Penjualan harian/mingguan/bulanan
- Laporan laba rugi
- Produk terlaris
- Total transaksi per kasir
- Export laporan

### ☁️ Sinkronisasi Offline-Online
- Local database (SQLite)
- Auto-sync saat online
- Conflict resolution
- Queue untuk transaksi offline
- Status sinkronisasi real-time

### 🎨 UI/UX
- Mode dark/light
- Responsive design
- Support PWA
- Barcode scanning

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (local) + Supabase (cloud)
- **Authentication**: JWT
- **Sync**: Custom sync engine

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: Redux/Context API
- **Local Storage**: IndexedDB
- **PWA**: Service Worker, Workbox
- **Styling**: Tailwind CSS
- **UI Components**: Custom components

## Instalasi & Setup

### Prerequisites
- Node.js v16+
- npm atau yarn

### Development

```bash
# Clone repository
git clone <repo-url>
cd pos-offline-online

# Setup
npm run setup

# Run development
npm run dev

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### Production

```bash
# Build frontend
npm run build

# Start backend
npm start
```

## Struktur Project

```
pos-offline-online/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── db/
│   │   └── index.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

Buat file `.env` di root project:

```
# Backend
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./data/pos.db

# Frontend
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=POS System
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - Get semua produk
- `POST /api/products` - Create produk
- `PUT /api/products/:id` - Update produk
- `DELETE /api/products/:id` - Delete produk

### Transactions
- `GET /api/transactions` - Get transaksi
- `POST /api/transactions` - Create transaksi
- `GET /api/transactions/:id` - Get detail transaksi
- `POST /api/transactions/sync` - Sync offline transactions

### Stock
- `GET /api/stock` - Get stok produk
- `POST /api/stock/in` - Stock in
- `POST /api/stock/out` - Stock out
- `GET /api/stock/history` - Riwayat stok

### Reports
- `GET /api/reports/sales` - Laporan penjualan
- `GET /api/reports/profit` - Laporan laba rugi
- `GET /api/reports/top-products` - Produk terlaris

## Kontribusi

Panduan kontribusi akan ditambahkan kemudian.

## License

MIT
