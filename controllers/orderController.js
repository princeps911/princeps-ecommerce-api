// controllers/orderController.js
const { Cart, CartItem, Product, Order, OrderItem } = require('../models');

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
      status: 'completed'  // Assume success
    });

    // Create order items + update stock
    for (const item of cart.CartItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.Product.price
      });

      // Reduce stock
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

module.exports = { checkout };