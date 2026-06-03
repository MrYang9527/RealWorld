const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'realworld-dev-secret-key-2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Token ')) {
    return res.status(401).json({ errors: { body: ['需要登录'] } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ errors: { body: ['登录已过期，请重新登录'] } });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Token ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
    } catch (err) {
      // 可选认证，忽略无效token
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth, JWT_SECRET };
