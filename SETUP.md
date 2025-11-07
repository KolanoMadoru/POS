# Setup & Installation Guide

## Prerequisites
- Node.js v16 atau lebih tinggi
- npm atau yarn
- Git

## Quick Start

### 1. Install Dependencies
```bash
npm run setup
```

Ini akan menginstall dependencies untuk backend dan frontend.

### 2. Development Mode
```bash
npm run dev
```

Ini akan menjalankan backend dan frontend secara bersamaan:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### 3. Database
Database SQLite akan otomatis dibuat di `./data/pos.db` saat backend pertama kali dijalankan.

Demo data akan otomatis di-seed meliputi:
- 2 demo users (admin & kasir)
- 6 demo products

## Manual Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Demo Credentials
Login dengan salah satu akun berikut:

### Admin Account
- Email: `admin@pos.local`
- Password: `password`
- Role: Admin (akses penuh)

### Kasir Account
- Email: `kasir@pos.local`
- Password: `password`
- Role: Kasir (transaksi & laporan)

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
DB_PATH=./data/pos.db
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=POS System
```

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
```

Output akan ada di `frontend/dist/`.

### Run Backend in Production
```bash
NODE_ENV=production npm start
```

## Fitur Utama

### ✅ Sudah Diimplementasikan
- [x] User authentication (Register, Login, Logout)
- [x] Role-based access control
- [x] Product management (CRUD)
- [x] POS transactions
- [x] Shopping cart
- [x] Discount & tax calculation
- [x] Stock management
- [x] Transaction history
- [x] Receipt printing
- [x] Reports (Sales, Profit, Top Products, Cashier, Category)
- [x] Offline-Online sync
- [x] Local data persistence (IndexedDB + SQLite)
- [x] Dark mode
- [x] Responsive design

### 🔄 In Development / Optional Enhancements
- [ ] Barcode scanning with camera
- [ ] Multi-store support
- [ ] Advanced analytics
- [ ] Customer loyalty program
- [ ] Payment gateway integration
- [ ] Mobile app version
- [ ] Real-time notifications

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product detail
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories` - Get all categories

### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction detail
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/summary` - Get summary

### Stock
- `GET /api/stock` - List all stock
- `GET /api/stock/product/:productId` - Get stock by product
- `POST /api/stock/in` - Stock in
- `POST /api/stock/out` - Stock out
- `GET /api/stock/history` - Get stock history

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/profit` - Profit report
- `GET /api/reports/top-products` - Top products
- `GET /api/reports/cashier` - Cashier report
- `GET /api/reports/category` - Category report

### Sync
- `POST /api/sync/get-unsynced` - Get unsynced data
- `POST /api/sync/sync` - Sync data
- `GET /api/sync/status` - Get sync status
- `POST /api/sync/queue` - Add to sync queue
- `GET /api/sync/queue` - Get sync queue

## Troubleshooting

### Port already in use
Jika port 5000 atau 3000 sudah digunakan, ubah di:
- Backend: Edit `PORT` di `.env` atau `backend/server.js`
- Frontend: Edit konfigurasi di `frontend/vite.config.ts`

### Database connection error
Pastikan folder `./data/` bisa dibuat di root project. Ubah `DB_PATH` di `.env` jika perlu.

### CORS error
Pastikan `CORS_ORIGIN` di backend `.env` sesuai dengan URL frontend development.

### Module not found errors
```bash
cd backend && npm install
cd frontend && npm install
```

## Database Schema

### Users
- id (UUID, PK)
- email (UNIQUE)
- password (hashed)
- name
- role (admin/kasir/owner)
- phone, address, created_at, updated_at

### Products
- id (UUID, PK)
- sku (UNIQUE)
- name, category, description
- price_buy, price_sell
- unit, stock, min_stock
- image_url, created_at, updated_at

### Transactions
- id (UUID, PK)
- cashier_id (FK to users)
- subtotal, discount_value, discount_percent
- tax_value, tax_percent, total
- amount_paid, change_amount
- payment_method, notes
- synced, created_at

### Transaction Items
- id (UUID, PK)
- transaction_id (FK)
- product_id (FK)
- quantity, price, discount_value, discount_percent, subtotal

### Stock History
- id (UUID, PK)
- product_id (FK)
- type (in/out)
- quantity, notes, user_id
- synced, created_at

## Next Steps

1. Customize branding (logo, colors, store name)
2. Setup production database
3. Configure payment gateway
4. Add more product categories
5. Implement barcode scanning
6. Setup automated backups
7. Configure email notifications
8. Add customer management
9. Implement multi-store support
10. Deploy to production

## Support

Untuk masalah teknis, periksa:
- Console logs (browser DevTools untuk frontend)
- Terminal output (backend)
- SQLite database di `./data/pos.db`

## License

MIT
