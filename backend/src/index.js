const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db');

const userRoutes = require('./routes/users');
const articleRoutes = require('./routes/articles');
const profileRoutes = require('./routes/profiles');
const tagRoutes = require('./routes/tags');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api', userRoutes);
app.use('/api', articleRoutes);
app.use('/api', profileRoutes);
app.use('/api', tagRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ errors: { body: ['接口不存在'] } });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ errors: { body: ['服务器内部错误'] } });
});

app.listen(PORT, () => {
  // 首次启动时如果数据库为空，自动填充种子数据
  const db = getDb();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('🔄 检测到空数据库，正在填充种子数据...');
    try {
      require(path.join(__dirname, '..', 'seed'));
    } catch (err) {
      console.log('💡 运行 npm run seed 可手动填充初始数据');
    }
  }
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});

module.exports = app;
