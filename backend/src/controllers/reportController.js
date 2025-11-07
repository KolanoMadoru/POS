const { getDatabase } = require('../db/database');
const { formatResponse, formatPrice } = require('../utils/helpers');

class ReportController {
  static async getSalesReport(req, res) {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const db = getDatabase();

    try {
      let query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(total) as total_sales,
          SUM(discount_value) as total_discount,
          SUM(tax_value) as total_tax,
          AVG(total) as avg_transaction
        FROM transactions
        WHERE 1=1
      `;
      let params = [];

      if (startDate) {
        query += ' AND DATE(created_at) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(created_at) <= DATE(?)';
        params.push(endDate);
      }

      query += ' GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC';

      const sales = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Sales report retrieved', { sales }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve sales report: ' + error.message)
      );
    }
  }

  static async getProfitReport(req, res) {
    const { startDate, endDate } = req.query;
    const db = getDatabase();

    try {
      let query = `
        SELECT 
          COUNT(DISTINCT t.id) as transaction_count,
          SUM(t.total) as total_revenue,
          SUM(ti.quantity * p.price_buy) as total_cost,
          SUM(t.total) - SUM(ti.quantity * p.price_buy) as gross_profit,
          SUM(t.discount_value) as total_discount,
          (SUM(t.total) - SUM(ti.quantity * p.price_buy)) / NULLIF(SUM(t.total), 0) * 100 as profit_margin
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        WHERE 1=1
      `;
      let params = [];

      if (startDate) {
        query += ' AND DATE(t.created_at) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(t.created_at) <= DATE(?)';
        params.push(endDate);
      }

      const profit = db.prepare(query).get(...params);

      res.json(formatResponse(true, 'Profit report retrieved', {
        profit: {
          total_revenue: formatPrice(profit.total_revenue || 0),
          total_cost: formatPrice(profit.total_cost || 0),
          gross_profit: formatPrice(profit.gross_profit || 0),
          profit_margin: profit.profit_margin ? formatPrice(profit.profit_margin) : 0,
          transaction_count: profit.transaction_count || 0
        }
      }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve profit report: ' + error.message)
      );
    }
  }

  static async getTopProducts(req, res) {
    const { startDate, endDate, limit = 10 } = req.query;
    const db = getDatabase();

    try {
      let query = `
        SELECT 
          p.id,
          p.sku,
          p.name,
          p.category,
          SUM(ti.quantity) as total_quantity,
          SUM(ti.subtotal) as total_sales,
          COUNT(DISTINCT t.id) as transaction_count
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE 1=1
      `;
      let params = [];

      if (startDate) {
        query += ' AND DATE(t.created_at) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(t.created_at) <= DATE(?)';
        params.push(endDate);
      }

      query += ` GROUP BY p.id ORDER BY total_quantity DESC LIMIT ?`;
      params.push(parseInt(limit));

      const products = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Top products retrieved', { products }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve top products: ' + error.message)
      );
    }
  }

  static async getCashierReport(req, res) {
    const { startDate, endDate } = req.query;
    const db = getDatabase();

    try {
      let query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(t.id) as transaction_count,
          SUM(t.total) as total_sales,
          SUM(t.discount_value) as total_discount,
          AVG(t.total) as avg_transaction
        FROM users u
        LEFT JOIN transactions t ON u.id = t.cashier_id
        WHERE u.role = 'kasir'
      `;
      let params = [];

      if (startDate) {
        query += ' AND DATE(t.created_at) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(t.created_at) <= DATE(?)';
        params.push(endDate);
      }

      query += ' GROUP BY u.id ORDER BY total_sales DESC';

      const cashiers = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Cashier report retrieved', { cashiers }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve cashier report: ' + error.message)
      );
    }
  }

  static async getCategoryReport(req, res) {
    const { startDate, endDate } = req.query;
    const db = getDatabase();

    try {
      let query = `
        SELECT 
          p.category,
          COUNT(DISTINCT t.id) as transaction_count,
          SUM(ti.quantity) as total_quantity,
          SUM(ti.subtotal) as total_sales,
          SUM(ti.quantity * p.price_buy) as total_cost
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE 1=1
      `;
      let params = [];

      if (startDate) {
        query += ' AND DATE(t.created_at) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(t.created_at) <= DATE(?)';
        params.push(endDate);
      }

      query += ' GROUP BY p.category ORDER BY total_sales DESC';

      const categories = db.prepare(query).all(...params);

      res.json(formatResponse(true, 'Category report retrieved', { categories }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve category report: ' + error.message)
      );
    }
  }
}

module.exports = ReportController;
