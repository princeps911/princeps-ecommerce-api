// routes/orders.js
const express = require('express');
const router = express.Router();
const {
  checkout,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.use(authMiddleware);

// Customer routes
router.post('/checkout', checkout);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllOrders);
router.put('/admin/:id', adminMiddleware, updateOrderStatus);

module.exports = router;