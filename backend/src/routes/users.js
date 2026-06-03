const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post('/users', [
  body('user.username').trim().notEmpty().withMessage('用户名不能为空'),
  body('user.email').trim().isEmail().withMessage('邮箱格式不正确'),
  body('user.password').isLength({ min: 6 }).withMessage('密码至少6位'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: { body: errors.array().map(e => e.msg) } });
  }

  const { username, email, password } = req.body.user;
  const db = getDb();

  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      return res.status(422).json({ errors: { body: ['用户名或邮箱已存在'] } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword);

    const user = db.prepare('SELECT id, username, email, bio, image FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: { ...user, token } });
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ errors: { body: ['服务器错误'] } });
  }
});

// 登录
router.post('/users/login', [
  body('user.email').trim().isEmail().withMessage('邮箱格式不正确'),
  body('user.password').notEmpty().withMessage('密码不能为空'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: { body: errors.array().map(e => e.msg) } });
  }

  const { email, password } = req.body.user;
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(422).json({ errors: { body: ['邮箱或密码错误'] } });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(422).json({ errors: { body: ['邮箱或密码错误'] } });
    }

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: { ...safeUser, token } });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ errors: { body: ['服务器错误'] } });
  }
});

// 获取当前用户
router.get('/user', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, email, bio, image FROM users WHERE id = ?').get(req.userId);
  if (!user) {
    return res.status(404).json({ errors: { body: ['用户不存在'] } });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { ...user, token } });
});

// 更新用户
router.put('/user', authMiddleware, async (req, res) => {
  const db = getDb();
  const updates = req.body.user || {};

  const fields = [];
  const values = [];

  if (updates.username) { fields.push('username = ?'); values.push(updates.username); }
  if (updates.email) { fields.push('email = ?'); values.push(updates.email); }
  if (updates.bio !== undefined) { fields.push('bio = ?'); values.push(updates.bio); }
  if (updates.image !== undefined) { fields.push('image = ?'); values.push(updates.image); }
  if (updates.password) {
    fields.push('password = ?');
    values.push(await bcrypt.hash(updates.password, 10));
  }

  if (fields.length > 0) {
    values.push(req.userId);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const user = db.prepare('SELECT id, username, email, bio, image FROM users WHERE id = ?').get(req.userId);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { ...user, token } });
});

module.exports = router;
