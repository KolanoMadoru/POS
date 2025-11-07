const { getDatabase } = require('../db/database');
const { generateId, formatResponse, formatPrice } = require('../utils/helpers');

class ProductController {
  static async getAll(req, res) {
    const { category, search, page = 1, limit = 50 } = req.query;
    const db = getDatabase();

    try {
      let query = 'SELECT * FROM products WHERE is_active = 1';
      let params = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (name LIKE ? OR sku LIKE ?)';
        params.push(`%${search}%`);
        params.push(`%${search}%`);
      }

      // Count total
      const countResult = db.prepare(query).all(...params);
      const total = countResult.length;

      // Pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const products = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Products retrieved', {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve products: ' + error.message)
      );
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    const db = getDatabase();

    try {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      if (!product) {
        return res.status(404).json(
          formatResponse(false, 'Product not found')
        );
      }

      res.json(formatResponse(true, 'Product retrieved', { product }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve product: ' + error.message)
      );
    }
  }

  static async create(req, res) {
    const {
      sku,
      name,
      category,
      description,
      price_buy,
      price_sell,
      unit,
      stock = 0,
      min_stock = 0,
      image_url
    } = req.body;

    if (!sku || !name || !category || !price_buy || !price_sell || !unit) {
      return res.status(400).json(
        formatResponse(false, 'Missing required fields')
      );
    }

    const db = getDatabase();

    try {
      // Check if SKU exists
      const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
      if (existing) {
        return res.status(409).json(
          formatResponse(false, 'Product with this SKU already exists')
        );
      }

      const productId = generateId();

      db.prepare(`
        INSERT INTO products (
          id, sku, name, category, description, price_buy, price_sell,
          unit, stock, min_stock, image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        productId, sku, name, category, description,
        formatPrice(price_buy), formatPrice(price_sell),
        unit, stock, min_stock, image_url
      );

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

      res.status(201).json(
        formatResponse(true, 'Product created successfully', { product })
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to create product: ' + error.message)
      );
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const {
      sku,
      name,
      category,
      description,
      price_buy,
      price_sell,
      unit,
      min_stock,
      image_url
    } = req.body;

    const db = getDatabase();

    try {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!product) {
        return res.status(404).json(
          formatResponse(false, 'Product not found')
        );
      }

      // Check if new SKU conflicts
      if (sku && sku !== product.sku) {
        const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
        if (existing) {
          return res.status(409).json(
            formatResponse(false, 'Another product already has this SKU')
          );
        }
      }

      let updates = [];
      let params = [];

      const fields = { sku, name, category, description, price_buy, price_sell, unit, min_stock, image_url };
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          if (['price_buy', 'price_sell'].includes(key)) {
            params.push(formatPrice(value));
          } else {
            params.push(value);
          }
        }
      }

      if (updates.length === 0) {
        return res.status(400).json(
          formatResponse(false, 'No updates provided')
        );
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      db.prepare(`
        UPDATE products SET ${updates.join(', ')}
        WHERE id = ?
      `).run(...params);

      const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      res.json(
        formatResponse(true, 'Product updated successfully', { product: updated })
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to update product: ' + error.message)
      );
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    const db = getDatabase();

    try {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!product) {
        return res.status(404).json(
          formatResponse(false, 'Product not found')
        );
      }

      db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);

      res.json(
        formatResponse(true, 'Product deleted successfully')
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to delete product: ' + error.message)
      );
    }
  }

  static async getCategories(req, res) {
    const db = getDatabase();

    try {
      const categories = db.prepare(`
        SELECT DISTINCT category FROM products WHERE is_active = 1 ORDER BY category
      `).all();

      res.json(
        formatResponse(true, 'Categories retrieved', {
          categories: categories.map(c => c.category)
        })
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve categories: ' + error.message)
      );
    }
  }
}

module.exports = ProductController;
