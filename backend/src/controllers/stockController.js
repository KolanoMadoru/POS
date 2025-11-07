const { getDatabase } = require('../db/database');
const { generateId, formatResponse } = require('../utils/helpers');

class StockController {
  static async getStockByProduct(req, res) {
    const { productId } = req.params;
    const db = getDatabase();

    try {
      const product = db.prepare(`
        SELECT id, name, sku, stock, min_stock FROM products WHERE id = ?
      `).get(productId);

      if (!product) {
        return res.status(404).json(
          formatResponse(false, 'Product not found')
        );
      }

      const history = db.prepare(`
        SELECT * FROM stock_history WHERE product_id = ? ORDER BY created_at DESC LIMIT 50
      `).all(productId);

      const alert = product.stock <= product.min_stock;

      res.json(formatResponse(true, 'Stock retrieved', {
        stock: {
          product_id: productId,
          product_name: product.name,
          current_stock: product.stock,
          min_stock: product.min_stock,
          alert
        },
        history
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve stock: ' + error.message)
      );
    }
  }

  static async getAllStock(req, res) {
    const { lowStockOnly = false, page = 1, limit = 50 } = req.query;
    const db = getDatabase();

    try {
      let query = `
        SELECT id, name, sku, stock, min_stock, unit, category,
               CASE WHEN stock <= min_stock THEN 1 ELSE 0 END as low_stock
        FROM products WHERE is_active = 1
      `;
      let params = [];

      if (lowStockOnly === 'true') {
        query += ' AND stock <= min_stock';
      }

      const countResult = db.prepare(query).all(...params);
      const total = countResult.length;

      const offset = (page - 1) * limit;
      query += ' ORDER BY stock ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const stocks = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Stock list retrieved', {
        stocks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve stock: ' + error.message)
      );
    }
  }

  static async stockIn(req, res) {
    const { product_id, quantity, notes } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json(
        formatResponse(false, 'Invalid product or quantity')
      );
    }

    const db = getDatabase();

    try {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
      if (!product) {
        return res.status(404).json(
          formatResponse(false, 'Product not found')
        );
      }

      const insert = db.transaction(() => {
        db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(quantity, product_id);

        const historyId = generateId();
        db.prepare(`
          INSERT INTO stock_history (id, product_id, type, quantity, user_id, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(historyId, product_id, 'in', quantity, req.user.id, notes || 'Stock in');
      });

      insert();

      const updated = db.prepare('SELECT stock FROM products WHERE id = ?').get(product_id);

      res.json(formatResponse(true, 'Stock in recorded successfully', {
        product_id,
        new_stock: updated.stock,
        quantity_added: quantity
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to record stock in: ' + error.message)
      );
    }
  }

  static async stockOut(req, res) {
    const { product_id, quantity, notes } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json(
        formatResponse(false, 'Invalid product or quantity')
      );
    }

    const db = getDatabase();

    try {
      const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(product_id);
      if (!product) {
        return res.status(404).json(
          formatResponse(false, 'Product not found')
        );
      }

      if (product.stock < quantity) {
        return res.status(400).json(
          formatResponse(false, `Insufficient stock. Available: ${product.stock}`)
        );
      }

      const insert = db.transaction(() => {
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantity, product_id);

        const historyId = generateId();
        db.prepare(`
          INSERT INTO stock_history (id, product_id, type, quantity, user_id, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(historyId, product_id, 'out', quantity, req.user.id, notes || 'Stock out');
      });

      insert();

      const updated = db.prepare('SELECT stock FROM products WHERE id = ?').get(product_id);

      res.json(formatResponse(true, 'Stock out recorded successfully', {
        product_id,
        new_stock: updated.stock,
        quantity_removed: quantity
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to record stock out: ' + error.message)
      );
    }
  }

  static async getHistory(req, res) {
    const { product_id, type, page = 1, limit = 50 } = req.query;
    const db = getDatabase();

    try {
      let query = 'SELECT * FROM stock_history WHERE 1=1';
      let params = [];

      if (product_id) {
        query += ' AND product_id = ?';
        params.push(product_id);
      }

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      const countResult = db.prepare(query).all(...params);
      const total = countResult.length;

      const offset = (page - 1) * limit;
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const history = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Stock history retrieved', {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve history: ' + error.message)
      );
    }
  }
}

module.exports = StockController;
