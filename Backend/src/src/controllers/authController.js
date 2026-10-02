const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'caregrid-secret-key-2026-secure-jwt';

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, role, password } = req.body;

    if (!fullName || !email || !role || !password) {
      return res.status(400).json({ success: false, message: 'Please provide fullName, email, role, and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const userId = `usr_${Math.random().toString(36).slice(2, 9)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (id, full_name, email, phone, role, password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name as "fullName", email, phone, role, created_at as "createdAt"`,
      [userId, fullName.trim(), normalizedEmail, phone || '', role, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userRow = result.rows[0];
    const isMatch = await bcrypt.compare(password, userRow.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = {
      id: userRow.id,
      fullName: userRow.full_name,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role
    };

    const token = generateToken(userRow);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current profile
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, full_name as "fullName", email, phone, role, created_at as "createdAt" FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (GET)
const getAllUsers = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, full_name as "fullName", email, phone, role, created_at as "createdAt" FROM users ORDER BY created_at DESC'
    );
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Delete user by ID (DELETE)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, full_name as "fullName"', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User ${result.rows[0].fullName} (${id}) deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser
};
