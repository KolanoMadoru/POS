# POS System API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Semua endpoint kecuali login/register memerlukan JWT token di header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register
**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "081234567890",
  "address": "Jakarta"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "kasir"
    },
    "token": "jwt_token"
  }
}
```

---

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "admin@pos.local",
  "password": "password"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@pos.local",
      "name": "Admin POS",
      "role": "admin"
    },
    "token": "jwt_token"
  }
}
```

---

### Logout
**POST** `/auth/logout`

Response:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Get Profile
**GET** `/auth/profile`

Response:
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@pos.local",
      "name": "Admin POS",
      "role": "admin",
      "phone": "081234567890",
      "address": "Jakarta",
      "created_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

---

### Update Profile
**PUT** `/auth/profile`

Request:
```json
{
  "name": "New Name",
  "phone": "081234567890",
  "address": "Jakarta",
  "password": "newpassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 📦 Product Endpoints

### Get All Products
**GET** `/products?page=1&limit=50&category=Minuman&search=Aqua`

Query Parameters:
- `page` (optional, default: 1)
- `limit` (optional, default: 50)
- `category` (optional)
- `search` (optional)

Response:
```json
{
  "success": true,
  "message": "Products retrieved",
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "SKU001",
        "name": "Aqua Mineral 600ml",
        "category": "Minuman",
        "description": "Air mineral kemasan",
        "price_buy": 3000,
        "price_sell": 5000,
        "unit": "pcs",
        "stock": 100,
        "min_stock": 20,
        "image_url": null,
        "is_active": true,
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 6
    }
  }
}
```

---

### Get Product by ID
**GET** `/products/:id`

Response:
```json
{
  "success": true,
  "message": "Product retrieved",
  "data": {
    "product": {
      "id": "uuid",
      "sku": "SKU001",
      "name": "Aqua Mineral 600ml",
      "category": "Minuman",
      "description": "Air mineral kemasan",
      "price_buy": 3000,
      "price_sell": 5000,
      "unit": "pcs",
      "stock": 100,
      "min_stock": 20,
      "image_url": null,
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

---

### Create Product
**POST** `/products`

Requires: `admin` or `owner` role

Request:
```json
{
  "sku": "SKU007",
  "name": "New Product",
  "category": "Makanan",
  "description": "Deskripsi produk",
  "price_buy": 5000,
  "price_sell": 10000,
  "unit": "pcs",
  "stock": 50,
  "min_stock": 10,
  "image_url": null
}
```

Response:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": "uuid",
      "sku": "SKU007",
      "name": "New Product",
      "category": "Makanan",
      "description": "Deskripsi produk",
      "price_buy": 5000,
      "price_sell": 10000,
      "unit": "pcs",
      "stock": 50,
      "min_stock": 10,
      "image_url": null,
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

---

### Update Product
**PUT** `/products/:id`

Requires: `admin` or `owner` role

Request:
```json
{
  "name": "Updated Name",
  "price_sell": 12000,
  "stock": 60
}
```

Response:
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": { /* updated product object */ }
  }
}
```

---

### Delete Product
**DELETE** `/products/:id`

Requires: `admin` or `owner` role

Response:
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Get Categories
**GET** `/products/categories`

Response:
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": {
    "categories": ["Minuman", "Snack", "Makanan"]
  }
}
```

---

## 🛒 Transaction Endpoints

### Get All Transactions
**GET** `/transactions?page=1&limit=50&startDate=2024-01-01&endDate=2024-01-31`

Query Parameters:
- `page` (optional, default: 1)
- `limit` (optional, default: 50)
- `startDate` (optional)
- `endDate` (optional)

Response:
```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "cashier_id": "uuid",
        "subtotal": 50000,
        "discount_value": 5000,
        "discount_percent": 10,
        "tax_value": 4500,
        "tax_percent": 10,
        "total": 49500,
        "amount_paid": 50000,
        "change_amount": 500,
        "payment_method": "cash",
        "notes": "Pembelian reguler",
        "created_at": "2024-01-01T10:00:00Z",
        "synced": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100
    }
  }
}
```

---

### Get Transaction by ID
**GET** `/transactions/:id`

Response:
```json
{
  "success": true,
  "message": "Transaction retrieved",
  "data": {
    "transaction": {
      "id": "uuid",
      "cashier_id": "uuid",
      "subtotal": 50000,
      "discount_value": 5000,
      "discount_percent": 10,
      "tax_value": 4500,
      "tax_percent": 10,
      "total": 49500,
      "amount_paid": 50000,
      "change_amount": 500,
      "payment_method": "cash",
      "items": [
        {
          "id": "uuid",
          "transaction_id": "uuid",
          "product_id": "uuid",
          "quantity": 5,
          "price": 5000,
          "discount_value": 0,
          "discount_percent": 0,
          "subtotal": 25000,
          "notes": null,
          "created_at": "2024-01-01T10:00:00Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00Z",
      "synced": true
    }
  }
}
```

---

### Create Transaction
**POST** `/transactions`

Requires: `kasir`, `admin`, or `owner` role

Request:
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 5,
      "price": 5000,
      "discount_value": 0,
      "discount_percent": 0,
      "subtotal": 25000
    },
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 10000,
      "discount_value": 0,
      "discount_percent": 0,
      "subtotal": 20000
    }
  ],
  "subtotal": 45000,
  "discount_value": 5000,
  "discount_percent": 10,
  "tax_value": 4000,
  "tax_percent": 10,
  "amount_paid": 50000,
  "payment_method": "cash",
  "notes": "Pembelian reguler"
}
```

Response:
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "uuid",
      "cashier_id": "uuid",
      "subtotal": 45000,
      "discount_value": 5000,
      "discount_percent": 10,
      "tax_value": 4000,
      "tax_percent": 10,
      "total": 44000,
      "amount_paid": 50000,
      "change_amount": 6000,
      "payment_method": "cash",
      "items": [
        /* transaction items */
      ],
      "created_at": "2024-01-01T10:00:00Z",
      "synced": false
    }
  }
}
```

---

### Get Transaction Summary
**GET** `/transactions/summary?startDate=2024-01-01&endDate=2024-01-31`

Response:
```json
{
  "success": true,
  "message": "Summary retrieved",
  "data": {
    "summary": {
      "total_sales": 500000,
      "transaction_count": 50,
      "total_discount": 25000
    }
  }
}
```

---

## 📊 Stock Endpoints

### Get All Stock
**GET** `/stock?page=1&limit=50&lowStockOnly=false`

Response:
```json
{
  "success": true,
  "message": "Stock list retrieved",
  "data": {
    "stocks": [
      {
        "id": "uuid",
        "name": "Aqua Mineral 600ml",
        "sku": "SKU001",
        "stock": 100,
        "min_stock": 20,
        "unit": "pcs",
        "category": "Minuman",
        "low_stock": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 6
    }
  }
}
```

---

### Get Stock by Product
**GET** `/stock/product/:productId`

Response:
```json
{
  "success": true,
  "message": "Stock retrieved",
  "data": {
    "stock": {
      "product_id": "uuid",
      "product_name": "Aqua Mineral 600ml",
      "current_stock": 100,
      "min_stock": 20,
      "alert": false
    },
    "history": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "type": "in",
        "quantity": 100,
        "notes": "Stock masuk",
        "user_id": "uuid",
        "created_at": "2024-01-01T10:00:00Z",
        "synced": true
      }
    ]
  }
}
```

---

### Stock In
**POST** `/stock/in`

Requires: `admin` or `owner` role

Request:
```json
{
  "product_id": "uuid",
  "quantity": 50,
  "notes": "Pembelian dari supplier"
}
```

Response:
```json
{
  "success": true,
  "message": "Stock in recorded successfully",
  "data": {
    "product_id": "uuid",
    "new_stock": 150,
    "quantity_added": 50
  }
}
```

---

### Stock Out
**POST** `/stock/out`

Requires: `admin` or `owner` role

Request:
```json
{
  "product_id": "uuid",
  "quantity": 10,
  "notes": "Penyesuaian stok"
}
```

Response:
```json
{
  "success": true,
  "message": "Stock out recorded successfully",
  "data": {
    "product_id": "uuid",
    "new_stock": 90,
    "quantity_removed": 10
  }
}
```

---

### Get Stock History
**GET** `/stock/history?product_id=uuid&type=in&page=1&limit=50`

Response:
```json
{
  "success": true,
  "message": "Stock history retrieved",
  "data": {
    "history": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "type": "in",
        "quantity": 100,
        "notes": "Stock masuk",
        "user_id": "uuid",
        "created_at": "2024-01-01T10:00:00Z",
        "synced": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100
    }
  }
}
```

---

## 📈 Report Endpoints

### Sales Report
**GET** `/reports/sales?startDate=2024-01-01&endDate=2024-01-31`

Requires: `admin` or `owner` role

Response:
```json
{
  "success": true,
  "message": "Sales report retrieved",
  "data": {
    "sales": [
      {
        "date": "2024-01-01",
        "transaction_count": 10,
        "total_sales": 100000,
        "total_discount": 10000,
        "total_tax": 10000,
        "avg_transaction": 10000
      }
    ]
  }
}
```

---

### Profit Report
**GET** `/reports/profit?startDate=2024-01-01&endDate=2024-01-31`

Requires: `admin` or `owner` role

Response:
```json
{
  "success": true,
  "message": "Profit report retrieved",
  "data": {
    "profit": {
      "total_revenue": 500000,
      "total_cost": 300000,
      "gross_profit": 200000,
      "profit_margin": 40,
      "transaction_count": 50
    }
  }
}
```

---

### Top Products
**GET** `/reports/top-products?startDate=2024-01-01&endDate=2024-01-31&limit=10`

Requires: `admin` or `owner` role

Response:
```json
{
  "success": true,
  "message": "Top products retrieved",
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "SKU001",
        "name": "Aqua Mineral 600ml",
        "category": "Minuman",
        "total_quantity": 1000,
        "total_sales": 5000000,
        "transaction_count": 500
      }
    ]
  }
}
```

---

### Cashier Report
**GET** `/reports/cashier?startDate=2024-01-01&endDate=2024-01-31`

Requires: `admin` or `owner` role

Response:
```json
{
  "success": true,
  "message": "Cashier report retrieved",
  "data": {
    "cashiers": [
      {
        "id": "uuid",
        "name": "Kasir Demo",
        "email": "kasir@pos.local",
        "transaction_count": 100,
        "total_sales": 500000,
        "total_discount": 50000,
        "avg_transaction": 5000
      }
    ]
  }
}
```

---

### Category Report
**GET** `/reports/category?startDate=2024-01-01&endDate=2024-01-31`

Requires: `admin` or `owner` role

Response:
```json
{
  "success": true,
  "message": "Category report retrieved",
  "data": {
    "categories": [
      {
        "category": "Minuman",
        "transaction_count": 50,
        "total_quantity": 500,
        "total_sales": 250000,
        "total_cost": 150000
      }
    ]
  }
}
```

---

## ☁️ Sync Endpoints

### Get Unsynced Data
**POST** `/sync/get-unsynced`

Response:
```json
{
  "success": true,
  "message": "Unsynced data retrieved",
  "data": {
    "unsynced": {
      "products": [],
      "transactions": [
        {
          "id": "uuid",
          "cashier_id": "uuid",
          "subtotal": 45000,
          "discount_value": 5000,
          "discount_percent": 10,
          "tax_value": 4000,
          "tax_percent": 10,
          "total": 44000,
          "amount_paid": 50000,
          "change_amount": 6000,
          "payment_method": "cash",
          "created_at": "2024-01-01T10:00:00Z",
          "synced": false
        }
      ],
      "stock_history": [],
      "transaction_items": []
    }
  }
}
```

---

### Sync Data
**POST** `/sync/sync`

Request:
```json
{
  "products": ["uuid1", "uuid2"],
  "transactions": ["uuid3", "uuid4"],
  "stock_history": ["uuid5"]
}
```

Response:
```json
{
  "success": true,
  "message": "Data synced successfully",
  "data": {
    "products_synced": 2,
    "transactions_synced": 2,
    "stock_synced": 1,
    "errors": []
  }
}
```

---

### Get Sync Status
**GET** `/sync/status`

Response:
```json
{
  "success": true,
  "message": "Sync status retrieved",
  "data": {
    "unsynced_products": 0,
    "unsynced_transactions": 5,
    "unsynced_stock_history": 0,
    "pending_queue": 0,
    "is_online": true
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No authorization header"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting & Pagination

- Default limit: 50 items
- Max limit: 1000 items
- Page numbering starts from 1

## Timestamps

Semua timestamps dalam ISO 8601 format (UTC):
```
2024-01-01T10:00:00Z
```

## Monetary Values

Semua nilai uang dalam integer (rupiah), contoh:
- Rp 5.000 = 5000
- Rp 10.500 = 10500
- Rp 1.000.000 = 1000000
