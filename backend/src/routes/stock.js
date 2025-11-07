const express = require('express');
const router = express.Router();
const StockController = require('../controllers/stockController');
const { authorize } = require('../middleware/auth');

router.get('/', StockController.getAllStock);
router.get('/product/:productId', StockController.getStockByProduct);
router.post('/in', authorize('admin', 'owner'), StockController.stockIn);
router.post('/out', authorize('admin', 'owner'), StockController.stockOut);
router.get('/history', StockController.getHistory);

module.exports = router;
