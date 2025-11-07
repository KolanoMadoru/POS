const { getDatabase } = require('../db/database');
const { generateId, formatResponse } = require('../utils/helpers');

class SyncController {
  static async getUnsyncedData(req, res) {
    const db = getDatabase();

    try {
      const unsynced = {
        products: db.prepare('SELECT * FROM products WHERE synced = 0').all(),
        transactions: db.prepare('SELECT * FROM transactions WHERE synced = 0').all(),
        stock_history: db.prepare('SELECT * FROM stock_history WHERE synced = 0').all()
      };

      // Get transaction items for unsynced transactions
      if (unsynced.transactions.length > 0) {
        const transactionIds = unsynced.transactions.map(t => t.id);
        unsynced.transaction_items = db.prepare(`
          SELECT * FROM transaction_items
          WHERE transaction_id IN (${transactionIds.map(() => '?').join(',')})
        `).all(...transactionIds);
      }

      res.json(formatResponse(true, 'Unsynced data retrieved', { unsynced }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve unsynced data: ' + error.message)
      );
    }
  }

  static async syncData(req, res) {
    const { products = [], transactions = [], stock_history = [] } = req.body;
    const db = getDatabase();

    try {
      const syncResults = {
        products_synced: 0,
        transactions_synced: 0,
        stock_synced: 0,
        errors: []
      };

      const transaction = db.transaction(() => {
        // Mark products as synced
        for (const productId of products) {
          db.prepare(`
            UPDATE products SET synced = 1, last_synced = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(productId);
          syncResults.products_synced++;
        }

        // Mark transactions as synced
        for (const transactionId of transactions) {
          db.prepare(`
            UPDATE transactions SET synced = 1, last_synced = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(transactionId);
          syncResults.transactions_synced++;
        }

        // Mark stock history as synced
        for (const historyId of stock_history) {
          db.prepare(`
            UPDATE stock_history SET synced = 1
            WHERE id = ?
          `).run(historyId);
          syncResults.stock_synced++;
        }
      });

      transaction();

      res.json(formatResponse(true, 'Data synced successfully', syncResults));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Sync failed: ' + error.message)
      );
    }
  }

  static async addToSyncQueue(req, res) {
    const { entity_type, entity_id, action, data } = req.body;

    if (!entity_type || !entity_id || !action) {
      return res.status(400).json(
        formatResponse(false, 'Missing required fields')
      );
    }

    const db = getDatabase();

    try {
      const queueId = generateId();
      db.prepare(`
        INSERT INTO sync_queue (id, entity_type, entity_id, action, data)
        VALUES (?, ?, ?, ?, ?)
      `).run(queueId, entity_type, entity_id, action, JSON.stringify(data));

      res.json(formatResponse(true, 'Item added to sync queue', { queue_id: queueId }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to add to sync queue: ' + error.message)
      );
    }
  }

  static async getSyncQueue(req, res) {
    const db = getDatabase();

    try {
      const queue = db.prepare(`
        SELECT * FROM sync_queue WHERE processed = 0 ORDER BY created_at ASC
      `).all();

      res.json(formatResponse(true, 'Sync queue retrieved', { queue }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve sync queue: ' + error.message)
      );
    }
  }

  static async markQueueProcessed(req, res) {
    const { queue_ids } = req.body;

    if (!queue_ids || !Array.isArray(queue_ids)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid queue IDs')
      );
    }

    const db = getDatabase();

    try {
      const placeholders = queue_ids.map(() => '?').join(',');
      db.prepare(`
        UPDATE sync_queue SET processed = 1, processed_at = CURRENT_TIMESTAMP
        WHERE id IN (${placeholders})
      `).run(...queue_ids);

      res.json(formatResponse(true, 'Queue marked as processed'));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to mark queue: ' + error.message)
      );
    }
  }

  static async getSyncStatus(req, res) {
    const db = getDatabase();

    try {
      const status = {
        unsynced_products: db.prepare('SELECT COUNT(*) as count FROM products WHERE synced = 0').get().count,
        unsynced_transactions: db.prepare('SELECT COUNT(*) as count FROM transactions WHERE synced = 0').get().count,
        unsynced_stock_history: db.prepare('SELECT COUNT(*) as count FROM stock_history WHERE synced = 0').get().count,
        pending_queue: db.prepare('SELECT COUNT(*) as count FROM sync_queue WHERE processed = 0').get().count
      };

      res.json(formatResponse(true, 'Sync status retrieved', status));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve sync status: ' + error.message)
      );
    }
  }
}

module.exports = SyncController;
