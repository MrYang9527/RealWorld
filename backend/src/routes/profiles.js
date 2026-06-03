const express = require('express');
const { getDb } = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 获取用户资料
router.get('/profiles/:username', optionalAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, bio, image FROM users WHERE username = ?').get(req.params.username);

  if (!user) {
    return res.status(404).json({ errors: { body: ['用户不存在'] } });
  }

  let following = false;
  if (req.userId) {
    const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(req.userId, user.id);
    following = !!follow;
  }

  res.json({
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following,
    },
  });
});

// 关注用户
router.post('/profiles/:username/follow', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, bio, image FROM users WHERE username = ?').get(req.params.username);

  if (!user) {
    return res.status(404).json({ errors: { body: ['用户不存在'] } });
  }
  if (user.id === req.userId) {
    return res.status(422).json({ errors: { body: ['不能关注自己'] } });
  }

  db.prepare('INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)').run(req.userId, user.id);

  res.json({
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: true,
    },
  });
});

// 取消关注
router.delete('/profiles/:username/follow', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, bio, image FROM users WHERE username = ?').get(req.params.username);

  if (!user) {
    return res.status(404).json({ errors: { body: ['用户不存在'] } });
  }

  db.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?').run(req.userId, user.id);

  res.json({
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: false,
    },
  });
});

module.exports = router;
