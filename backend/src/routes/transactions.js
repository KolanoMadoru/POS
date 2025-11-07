const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const { authorize } = require('../middleware/auth');

router.get('/', TransactionController.getAll);
router.get('/summary', TransactionController.getSummary);
router.post('/', authorize('kasir', 'admin', 'owner'), TransactionController.create);
router.get('/:id', TransactionController.getById);

module.exports = router;
