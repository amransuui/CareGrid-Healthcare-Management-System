const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers, deleteUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
