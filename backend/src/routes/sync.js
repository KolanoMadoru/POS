const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/syncController');
const { authenticate } = require('../middleware/auth');

// Public endpoints for offline clients
router.post('/get-unsynced', SyncController.getUnsyncedData);
router.post('/sync', SyncController.syncData);
router.post('/queue', authenticate, SyncController.addToSyncQueue);
router.get('/queue', authenticate, SyncController.getSyncQueue);
router.post('/queue/mark-processed', authenticate, SyncController.markQueueProcessed);
router.get('/status', authenticate, SyncController.getSyncStatus);

module.exports = router;
