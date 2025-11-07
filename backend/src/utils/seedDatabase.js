const { getDatabase } = require('../db/database');
const { hashPassword, generateId } = require('./helpers');

async function seedDatabase() {
  const db = getDatabase();

  try {
    // Check if demo users already exist
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@pos.local');
    
    if (!existingUser) {
      // Create demo users
      const adminPassword = await hashPassword('password');
      const kasirPassword = await hashPassword('password');

      db.prepare(`
        INSERT INTO users (id, email, password, name, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        generateId(),
        'admin@pos.local',
        adminPassword,
        'Admin POS',
        'admin',
        '081234567890',
        'Jakarta, Indonesia'
      );

      db.prepare(`
        INSERT INTO users (id, email, password, name, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        generateId(),
        'kasir@pos.local',
        kasirPassword,
        'Kasir Demo',
        'kasir',
        '081987654321',
        'Jakarta, Indonesia'
      );

      // Create demo products
      const products = [
        {
          sku: 'SKU001',
          name: 'Aqua Mineral 600ml',
          category: 'Minuman',
          price_buy: 3000,
          price_sell: 5000,
          unit: 'pcs',
          stock: 100,
          min_stock: 20
        },
        {
          sku: 'SKU002',
          name: 'Snack Rinso 35g',
          category: 'Snack',
          price_buy: 2500,
          price_sell: 4500,
          unit: 'pcs',
          stock: 80,
          min_stock: 15
        },
        {
          sku: 'SKU003',
          name: 'Susu Indomilk 250ml',
          category: 'Minuman',
          price_buy: 4000,
          price_sell: 6500,
          unit: 'pcs',
          stock: 60,
          min_stock: 10
        },
        {
          sku: 'SKU004',
          name: 'Teh Botol Sosro 200ml',
          category: 'Minuman',
          price_buy: 2000,
          price_sell: 3500,
          unit: 'pcs',
          stock: 120,
          min_stock: 25
        },
        {
          sku: 'SKU005',
          name: 'Chitato 25g',
          category: 'Snack',
          price_buy: 3000,
          price_sell: 5500,
          unit: 'pcs',
          stock: 50,
          min_stock: 10
        },
        {
          sku: 'SKU006',
          name: 'Roti Tawar Ganda Empuk 400g',
          category: 'Makanan',
          price_buy: 8000,
          price_sell: 12000,
          unit: 'pack',
          stock: 30,
          min_stock: 5
        }
      ];

      for (const product of products) {
        db.prepare(`
          INSERT INTO products (id, sku, name, category, price_buy, price_sell, unit, stock, min_stock)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          generateId(),
          product.sku,
          product.name,
          product.category,
          product.price_buy,
          product.price_sell,
          product.unit,
          product.stock,
          product.min_stock
        );
      }

      console.log('✅ Demo data seeded successfully');
    } else {
      console.log('ℹ️  Demo data already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

module.exports = { seedDatabase };
