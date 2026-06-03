const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { slugify } = require('../utils/slug');

const router = express.Router();

// 辅助：构建文章返回对象
function buildArticle(article, currentUserId) {
  const db = getDb();

  const author = db.prepare('SELECT id, username, bio, image FROM users WHERE id = ?').get(article.author_id);

  // 标签
  const tagRows = db.prepare(`
    SELECT t.name FROM tags t
    JOIN article_tags at ON at.tag_id = t.id
    WHERE at.article_id = ?
  `).all(article.id);
  const tagList = tagRows.map(r => r.name);

  // 收藏数
  const favoritesCount = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE article_id = ?').get(article.id).count;

  // 当前用户是否收藏
  let favorited = false;
  if (currentUserId) {
    const fav = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND article_id = ?').get(currentUserId, article.id);
    favorited = !!fav;
  }

  // 作者是否被当前用户关注
  let following = false;
  if (currentUserId && author) {
    const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(currentUserId, author.id);
    following = !!follow;
  }

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    favorited,
    favoritesCount,
    author: {
      username: author.username,
      bio: author.bio,
      image: author.image,
      following,
    },
  };
}

// 处理文章标签
function syncTags(db, articleId, tagList) {
  if (!tagList || tagList.length === 0) return;

  // 清除旧标签
  db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);

  for (const tagName of tagList) {
    let tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName);
    if (!tag) {
      const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(tagName);
      tag = { id: result.lastInsertRowid };
    }
    db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(articleId, tag.id);
  }
}

// 获取文章列表
router.get('/articles', optionalAuth, (req, res) => {
  const db = getDb();
  const { tag, author, favorited, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT DISTINCT a.* FROM articles a';
  let params = [];
  const conditions = [];

  if (tag) {
    query += ' JOIN article_tags at ON at.article_id = a.id JOIN tags t ON t.id = at.tag_id';
    conditions.push('t.name = ?');
    params.push(tag);
  }

  if (author) {
    query += ' JOIN users u ON u.id = a.author_id';
    conditions.push('u.username = ?');
    params.push(author);
  }

  if (favorited) {
    query += ' JOIN favorites f ON f.article_id = a.id JOIN users fu ON fu.id = f.user_id';
    conditions.push('fu.username = ?');
    params.push(favorited);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // 获取总数
  const countQuery = query.replace('SELECT DISTINCT a.*', 'SELECT COUNT(DISTINCT a.id) as count');
  const totalCount = db.prepare(countQuery).get(...params).count;

  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const articles = db.prepare(query).all(...params);

  res.json({
    articles: articles.map(a => buildArticle(a, req.userId)),
    articlesCount: totalCount,
  });
});

// 获取关注用户的文章（Feed）
router.get('/articles/feed', authMiddleware, (req, res) => {
  const db = getDb();
  const { limit = 20, offset = 0 } = req.query;

  const articles = db.prepare(`
    SELECT DISTINCT a.* FROM articles a
    JOIN follows f ON f.followee_id = a.author_id
    WHERE f.follower_id = ?
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.userId, Number(limit), Number(offset));

  const countRow = db.prepare(`
    SELECT COUNT(DISTINCT a.id) as count FROM articles a
    JOIN follows f ON f.followee_id = a.author_id
    WHERE f.follower_id = ?
  `).get(req.userId);

  res.json({
    articles: articles.map(a => buildArticle(a, req.userId)),
    articlesCount: countRow.count,
  });
});

// 获取单篇文章
router.get('/articles/:slug', optionalAuth, (req, res) => {
  const db = getDb();
  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['文章不存在'] } });
  }

  res.json({ article: buildArticle(article, req.userId) });
});

// 创建文章
router.post('/articles', authMiddleware, [
  body('article.title').trim().notEmpty().withMessage('标题不能为空'),
  body('article.description').trim().notEmpty().withMessage('摘要不能为空'),
  body('article.body').trim().notEmpty().withMessage('正文不能为空'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: { body: errors.array().map(e => e.msg) } });
  }

  const db = getDb();
  const { title, description, body, tagList = [] } = req.body.article;
  const slug = slugify(title);

  const result = db.prepare(
    'INSERT INTO articles (slug, title, description, body, author_id) VALUES (?, ?, ?, ?, ?)'
  ).run(slug, title, description, body, req.userId);

  syncTags(db, result.lastInsertRowid, tagList);

  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ article: buildArticle(article, req.userId) });
});

// 更新文章
router.put('/articles/:slug', authMiddleware, (req, res) => {
  const db = getDb();
  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['文章不存在'] } });
  }
  if (article.author_id !== req.userId) {
    return res.status(403).json({ errors: { body: ['无权修改此文章'] } });
  }

  const updates = req.body.article || {};
  const fields = [];
  const values = [];

  if (updates.title) {
    fields.push('title = ?');
    values.push(updates.title);
    fields.push('slug = ?');
    values.push(slugify(updates.title));
  }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.body !== undefined) { fields.push('body = ?'); values.push(updates.body); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(article.id);
    db.prepare(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  if (updates.tagList) {
    syncTags(db, article.id, updates.tagList);
  }

  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(article.id);
  res.json({ article: buildArticle(updated, req.userId) });
});

// 删除文章
router.delete('/articles/:slug', authMiddleware, (req, res) => {
  const db = getDb();
  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['文章不存在'] } });
  }
  if (article.author_id !== req.userId) {
    return res.status(403).json({ errors: { body: ['无权删除此文章'] } });
  }

  db.prepare('DELETE FROM articles WHERE id = ?').run(article.id);
  res.json({ message: '删除成功' });
});

// 收藏文章
router.post('/articles/:slug/favorite', authMiddleware, (req, res) => {
  const db = getDb();
  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['文章不存在'] } });
  }

  db.prepare('INSERT OR IGNORE INTO favorites (user_id, article_id) VALUES (?, ?)').run(req.userId, article.id);
  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(article.id);
  res.json({ article: buildArticle(updated, req.userId) });
});

// 取消收藏
router.delete('/articles/:slug/favorite', authMiddleware, (req, res) => {
  const db = getDb();
  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['文章不存在'] } });
  }

  db.prepare('DELETE FROM favorites WHERE user_id = ? AND article_id = ?').run(req.userId, article.id);
  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(article.id);
  res.json({ article: buildArticle(updated, req.userId) });
});

// ---- 评论相关 ----

// 获取评论
router.get('/articles/:slug/comments', optionalAuth, (req, res) => {
  const db = getDb();
  const article = db.prepare('SELECT id FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['文章不存在'] } });
  }

  const comments = db.prepare(`
    SELECT c.*, u.username, u.bio, u.image
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.article_id = ?
    ORDER BY c.created_at DESC
  `).all(article.id);

  const result = comments.map(c => ({
    id: c.id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    body: c.body,
    author: {
      username: c.username,
      bio: c.bio,
      image: c.image,
      following: req.userId
        ? !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(req.userId, c.author_id)
        : false,
    },
  }));

  res.json({ comments: result });
});

// 添加评论
router.post('/articles/:slug/comments', authMiddleware, [
  body('comment.body').trim().notEmpty().withMessage('评论不能为空'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: { body: errors.array().map(e => e.msg) } });
  }

  const db = getDb();
  const article = db.prepare('SELECT id FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['文章不存在'] } });
  }

  const result = db.prepare(
    'INSERT INTO comments (body, article_id, author_id) VALUES (?, ?, ?)'
  ).run(req.body.comment.body, article.id, req.userId);

  const comment = db.prepare(`
    SELECT c.*, u.username, u.bio, u.image
    FROM comments c JOIN users u ON u.id = c.author_id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({
    comment: {
      id: comment.id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      body: comment.body,
      author: {
        username: comment.username,
        bio: comment.bio,
        image: comment.image,
        following: false,
      },
    },
  });
});

// 删除评论
router.delete('/articles/:slug/comments/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);

  if (!comment) {
    return res.status(404).json({ errors: { body: ['评论不存在'] } });
  }
  if (comment.author_id !== req.userId) {
    return res.status(403).json({ errors: { body: ['无权删除此评论'] } });
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
