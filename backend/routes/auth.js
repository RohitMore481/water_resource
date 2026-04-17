const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// In-memory users store
const users = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@jeevan.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    avatar: 'A',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Public User',
    email: 'user@jeevan.com',
    passwordHash: bcrypt.hashSync('user123', 10),
    role: 'user',
    avatar: 'U',
    createdAt: new Date().toISOString(),
  },
];

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// POST /api/auth/register (Admin only)
router.post('/register', authenticate, requireAdmin, async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    passwordHash,
    role: ['admin', 'user'].includes(role) ? role : 'user',
    avatar: name.charAt(0).toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.status(201).json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/users (Admin only)
router.get('/users', authenticate, requireAdmin, (req, res) => {
  res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })));
});

module.exports = router;
