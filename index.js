// index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const { sequelize } = require('./models');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Prince Akpobasa E-commerce API!' });
});
//product route
const productRoutes = require('./routes/products');
app.use('/api/v1/products', productRoutes);
//user route

const userRoutes = require('./routes/users');
app.use('/api/v1/users', userRoutes);

//cart route
const cartRoutes = require('./routes/cart');
app.use('/api/v1/cart', cartRoutes);

//order route
const orderRoutes = require('./routes/orders');
app.use('/api/v1/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });