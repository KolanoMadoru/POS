const { getDatabase } = require('../db/database');
const { generateId, formatResponse, formatPrice, calculateTotal } = require('../utils/helpers');

class TransactionController {
  static async getAll(req, res) {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    const db = getDatabase();

    try {
      let query = 'SELECT * FROM transactions WHERE 1=1';
      let params = [];

      if (startDate) {
        query += ' AND DATE(created_at) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(created_at) <= DATE(?)';
        params.push(endDate);
      }

      const countResult = db.prepare(query).all(...params);
      const total = countResult.length;

      const offset = (page - 1) * limit;
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const transactions = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Transactions retrieved', {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve transactions: ' + error.message)
      );
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    const db = getDatabase();

    try {
      const transaction = db.prepare(`
        SELECT * FROM transactions WHERE id = ?
      `).get(id);

      if (!transaction) {
        return res.status(404).json(
          formatResponse(false, 'Transaction not found')
        );
      }

      const items = db.prepare(`
        SELECT * FROM transaction_items WHERE transaction_id = ?
      `).all(id);

      res.json(formatResponse(true, 'Transaction retrieved', {
        transaction: { ...transaction, items }
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve transaction: ' + error.message)
      );
    }
  }

  static async create(req, res) {
    const {
      items,
      subtotal,
      discount_value = 0,
      discount_percent = 0,
      tax_value = 0,
      tax_percent = 0,
      amount_paid,
      payment_method = 'cash',
      notes
    } = req.body;

    if (!items || items.length === 0 || !amount_paid) {
      return res.status(400).json(
        formatResponse(false, 'Invalid transaction data')
      );
    }

    const db = getDatabase();

    try {
      const transactionId = generateId();
      const cashierId = req.user.id;

      const total = calculateTotal(subtotal, discount_value, tax_value);
      const changeAmount = formatPrice(amount_paid - total);

      // Start transaction
      const insert = db.transaction(() => {
        db.prepare(`
          INSERT INTO transactions (
            id, cashier_id, subtotal, discount_value, discount_percent,
            tax_value, tax_percent, total, amount_paid, change_amount,
            payment_method, notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          transactionId, cashierId, formatPrice(subtotal),
          formatPrice(discount_value), discount_percent,
          formatPrice(tax_value), tax_percent,
          total, formatPrice(amount_paid), changeAmount,
          payment_method, notes
        );

        // Insert transaction items
        for (const item of items) {
          const itemId = generateId();
          db.prepare(`
            INSERT INTO transaction_items (
              id, transaction_id, product_id, quantity, price,
              discount_value, discount_percent, subtotal, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            itemId, transactionId, item.product_id, item.quantity,
            formatPrice(item.price), formatPrice(item.discount_value || 0),
            item.discount_percent || 0, formatPrice(item.subtotal), item.notes
          );

          // Update product stock
          db.prepare(`
            UPDATE products SET stock = stock - ? WHERE id = ?
          `).run(item.quantity, item.product_id);

          // Record stock history
          const historyId = generateId();
          db.prepare(`
            INSERT INTO stock_history (id, product_id, type, quantity, user_id, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(historyId, item.product_id, 'out', item.quantity, cashierId, `Sold in transaction ${transactionId}`);
        }
      });

      insert();

      const transaction = db.prepare(`
        SELECT * FROM transactions WHERE id = ?
      `).get(transactionId);

      const transactionItems = db.prepare(`
        SELECT * FROM transaction_items WHERE transaction_id = ?
      `).all(transactionId);

      res.status(201).json(
        formatResponse(true, 'Transaction created successfully', {
          transaction: { ...transaction, items: transactionItems }
        })
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to create transaction: ' + error.message)
      );
    }
  }

  static async getSummary(req, res) {
    const { startDate, endDate } = req.query;
    const db = getDatabase();

    try {
      let query = 'SELECT SUM(total) as total_sales, COUNT(*) as transaction_count, SUM(discount_value) as total_discount FROM transactions WHERE 1=1';
      let params = [];

      if (startDate) {
        query += ' AND DATE(created_at) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(created_at) <= DATE(?)';
        params.push(endDate);
      }

      const summary = db.prepare(query).get(...params);

      res.json(formatResponse(true, 'Summary retrieved', { summary }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve summary: ' + error.message)
      );
    }
  }
}

module.exports = TransactionController;
