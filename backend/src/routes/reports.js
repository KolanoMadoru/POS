const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authorize } = require('../middleware/auth');

router.get('/sales', authorize('admin', 'owner'), ReportController.getSalesReport);
router.get('/profit', authorize('admin', 'owner'), ReportController.getProfitReport);
router.get('/top-products', authorize('admin', 'owner'), ReportController.getTopProducts);
router.get('/cashier', authorize('admin', 'owner'), ReportController.getCashierReport);
router.get('/category', authorize('admin', 'owner'), ReportController.getCategoryReport);

module.exports = router;
