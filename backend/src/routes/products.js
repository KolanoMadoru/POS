const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authorize } = require('../middleware/auth');

router.get('/', ProductController.getAll);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getById);
router.post('/', authorize('admin', 'owner'), ProductController.create);
router.put('/:id', authorize('admin', 'owner'), ProductController.update);
router.delete('/:id', authorize('admin', 'owner'), ProductController.delete);

module.exports = router;
