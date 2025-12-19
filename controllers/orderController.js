// controllers/orderController.js
const { Cart, CartItem, Product, Order, OrderItem, User } = require('../models');

// Checkout
const checkout = async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        include: [Product]
      }]
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    let total = 0;
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Not enough stock for ${item.Product.name}` 
        });
      }
      total += item.Product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      total_price: total,
      status: 'completed'
    });

    // Create order items + update stock
    for (const item of cart.CartItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.Product.price
      });

      await item.Product.update({
        stock: item.Product.stock - item.quantity
      });
    }

    // Clear cart
    await CartItem.destroy({ where: { cart_id: cart.id } });

    res.status(201).json({
      message: 'Checkout successful',
      order: {
        id: order.id,
        total_price: order.total_price,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });
    if (!order || order.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: OrderItem, include: [Product] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update({ status });
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

module.exports = {
  checkout,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};