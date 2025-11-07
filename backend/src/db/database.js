const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/pos.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const database = getDatabase();

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'kasir',
      store_id TEXT,
      is_active BOOLEAN DEFAULT 1,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Products table
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      price_buy REAL NOT NULL,
      price_sell REAL NOT NULL,
      unit TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      image_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      store_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced BOOLEAN DEFAULT 0,
      last_synced DATETIME
    );
  `);

  // Stock history table
  database.exec(`
    CREATE TABLE IF NOT EXISTS stock_history (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      user_id TEXT,
      store_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced BOOLEAN DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Transactions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      cashier_id TEXT NOT NULL,
      store_id TEXT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced BOOLEAN DEFAULT 0,
      last_synced DATETIME,
      FOREIGN KEY (cashier_id) REFERENCES users(id)
    );
  `);

  // Transaction items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      discount_value REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Pending sync queue
  database.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed BOOLEAN DEFAULT 0,
      processed_at DATETIME
    );
  `);

  // Sync metadata
  database.exec(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      last_sync DATETIME,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      UNIQUE(entity_type)
    );
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashier_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
  `);

  console.log('✅ Database initialized successfully');
  return database;
}

module.exports = {
  getDatabase,
  initializeDatabase
};
