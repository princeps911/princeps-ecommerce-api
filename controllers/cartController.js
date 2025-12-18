// controllers/cartController.js
const { Cart, CartItem, Product } = require('../models');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        include: [Product]
      }]
    });
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  try {
    const product = await Product.findByPk(product_id);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ error: 'Product not available' });
    }

    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }

    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  try {
    const cartItem = await CartItem.findByPk(req.params.id);
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    const cart = await Cart.findByPk(cartItem.cart_id);
    if (cart.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await cartItem.update({ quantity });
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cartItem = await CartItem.findByPk(req.params.id);
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    const cart = await Cart.findByPk(cartItem.cart_id);
    if (cart.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};