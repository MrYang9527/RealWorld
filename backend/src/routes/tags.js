const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// 获取所有标签
router.get('/tags', (req, res) => {
  const db = getDb();
  const tags = db.prepare('SELECT name FROM tags ORDER BY name').all();
  res.json({ tags: tags.map(t => t.name) });
});

module.exports = router;
