# Developer Guide

## Project Overview

POS (Point of Sale) System adalah aplikasi modern untuk mengelola penjualan retail dengan fitur offline-online sync. Sistem ini terdiri dari:

- **Backend**: Node.js + Express.js + SQLite
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: SQLite (server) + IndexedDB (client)
- **State Management**: Zustand (frontend)

---

## Architecture

### Backend Architecture

```
backend/
├── server.js (entry point)
├── package.json
├── src/
│   ├── db/
│   │   └── database.js (SQLite setup, schema)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── transactionController.js
│   │   ├── stockController.js
│   │   ├── reportController.js
│   │   └── syncController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── transactions.js
│   │   ├── stock.js
│   │   ├── reports.js
│   │   └── sync.js
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   └── errorHandler.js
│   └── utils/
│       ├── helpers.js (utilities)
│       └── seedDatabase.js (demo data)
```

### Frontend Architecture

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── package.json
└── src/
    ├── main.tsx (entry point)
    ├── App.tsx (router setup)
    ├── index.css (global styles)
    ├── types/
    │   └── index.ts (TypeScript types)
    ├── services/
    │   └── api.ts (API client)
    ├── db/
    │   └── database.ts (IndexedDB setup)
    ├── store/
    │   ├── authStore.ts (auth state)
    │   ├── cartStore.ts (cart state)
    │   ├── productStore.ts (products state)
    │   └── syncStore.ts (sync state)
    ├── components/
    │   ├── Layout.tsx
    │   ├── Sidebar.tsx
    │   └── SyncStatus.tsx
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── POSPage.tsx
    │   ├── ProductsPage.tsx
    │   ├── TransactionsPage.tsx
    │   ├── StockPage.tsx
    │   ├── ReportsPage.tsx
    │   └── ProfilePage.tsx
    └── utils/
        ├── formatting.ts
        ├── validators.ts
        └── struk.ts
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL (hashed),
  name TEXT NOT NULL,
  role TEXT DEFAULT 'kasir' (admin/kasir/owner),
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price_buy REAL NOT NULL,
  price_sell REAL NOT NULL,
  unit TEXT NOT NULL (pcs/box/pack/kg/liter),
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  synced BOOLEAN DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  cashier_id TEXT NOT NULL (FK),
  subtotal REAL NOT NULL,
  discount_value REAL DEFAULT 0,
  discount_percent REAL DEFAULT 0,
  tax_value REAL DEFAULT 0,
  tax_percent REAL DEFAULT 0,
  total REAL NOT NULL,
  amount_paid REAL NOT NULL,
  change_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  synced BOOLEAN DEFAULT 0,
  created_at DATETIME
)
```

### Transaction Items Table
```sql
CREATE TABLE transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL (FK),
  product_id TEXT NOT NULL (FK),
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  discount_value REAL DEFAULT 0,
  discount_percent REAL DEFAULT 0,
  subtotal REAL NOT NULL,
  created_at DATETIME
)
```

### Stock History Table
```sql
CREATE TABLE stock_history (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL (FK),
  type TEXT NOT NULL (in/out),
  quantity INTEGER NOT NULL,
  notes TEXT,
  user_id TEXT,
  synced BOOLEAN DEFAULT 0,
  created_at DATETIME
)
```

---

## Development Workflow

### 1. Starting Development

```bash
# Install dependencies
npm run setup

# Start both backend and frontend
npm run dev

# Or start individually
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
```

### 2. Creating New Features

#### Adding a new API endpoint:

1. Create controller method in `backend/src/controllers/`
2. Define route in `backend/src/routes/`
3. Add error handling
4. Test with API client (Postman/Insomnia)

#### Adding a new page in frontend:

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Sidebar.tsx`
4. Use stores for state management

#### Adding a new data store:

1. Create store file in `frontend/src/store/`
2. Define state and actions using Zustand
3. Use in components with `const { ... } = useXxxStore()`

### 3. Code Standards

#### Backend
- Use prepared statements to prevent SQL injection
- Always hash passwords with bcryptjs
- Validate all inputs
- Use meaningful error messages
- Add indexes for frequently queried columns
- Handle transactions for data integrity

#### Frontend
- Use TypeScript for type safety
- Define types in `types/index.ts`
- Use Zustand stores for state management
- Keep components functional
- Use Tailwind CSS for styling
- No inline styles unless necessary

### 4. Error Handling

#### Backend
```javascript
// Always return consistent response format
try {
  // do something
  res.json({
    success: true,
    message: 'Operation successful',
    data: result
  });
} catch (error) {
  res.status(400).json({
    success: false,
    message: error.message
  });
}
```

#### Frontend
```typescript
// Handle errors gracefully
try {
  const response = await api.doSomething();
  // handle success
} catch (error: any) {
  const message = error.response?.data?.message || 'Operation failed';
  // show error to user
}
```

---

## Testing

### Backend Testing (TODO)
```bash
cd backend
npm run test
```

### Frontend Testing (TODO)
```bash
cd frontend
npm run test
```

---

## Performance Optimization

### Backend
- Use database indexes on frequently queried columns
- Implement pagination for large result sets
- Use connection pooling
- Cache static data
- Compress responses

### Frontend
- Use lazy loading for routes
- Implement pagination
- Use IndexedDB for offline storage
- Minimize bundle size
- Optimize images

---

## Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all inputs (backend & frontend)
- [ ] Sanitize user inputs
- [ ] Use secure headers (helmet.js)
- [ ] Implement CORS properly
- [ ] Never expose sensitive data in frontend
- [ ] Use environment variables for secrets
- [ ] Regular security updates

---

## Debugging

### Backend
```bash
# Run with debug logging
DEBUG=* npm run dev

# Check database
sqlite3 ./data/pos.db
> .tables
> .schema products
> SELECT COUNT(*) FROM products;
```

### Frontend
- Use browser DevTools
- Check IndexedDB in Application tab
- Use Redux DevTools (if implemented)
- Check Console for errors

---

## Common Issues & Solutions

### Issue: Port already in use
**Solution**: Change port in `.env` or use different port number

### Issue: Database locked
**Solution**: SQLite uses file locks. Ensure no multiple connections. Check for crashed processes.

### Issue: CORS errors
**Solution**: Check `CORS_ORIGIN` in backend `.env`

### Issue: IndexedDB quota exceeded
**Solution**: Clear old data or increase quota

### Issue: Sync not working
**Solution**: Check network connection and ensure backend is running

---

## Deployment

### Backend Deployment

1. Build: Already compiled (Node.js)
2. Set environment variables
3. Ensure database directory exists
4. Run: `NODE_ENV=production npm start`

### Frontend Deployment

1. Build: `npm run build`
2. Output: `frontend/dist/`
3. Serve static files
4. Configure API endpoint in `.env`

### Docker Setup (TODO)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start both
npm run dev:backend     # Start backend only
npm run dev:frontend    # Start frontend only

# Building
npm run build           # Build frontend
npm run lint            # Lint code
npm run format          # Format code

# Database
sqlite3 data/pos.db     # Open database
npm run seed-db         # Seed demo data (automatic)
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "feat: add feature description"

# Push
git push origin feature/feature-name

# Create pull request
```

---

## API Testing

### Using curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get products (with auth)
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>"
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Commit with clear messages
6. Push to your fork
7. Create a pull request

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Dexie.js](https://dexie.org/docs)

---

## License

MIT

---

For questions or issues, please refer to README.md or FEATURES.md
