// routes/orders.js
const express = require('express');
const router = express.Router();
const { checkout } = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // All order routes require login

router.post('/checkout', checkout);

module.exports = router;