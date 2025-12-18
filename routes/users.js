const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // we make this next step

router.get('/', authMiddleware, getAllUsers);                // admin only
router.get('/me', authMiddleware, getCurrentUser);           // logged in user
router.get('/:id', authMiddleware, getUserById);             // admin only
router.put('/:id', authMiddleware, updateUser);              // self or admin
router.delete('/:id', authMiddleware, deleteUser);           // admin only

module.exports = router;