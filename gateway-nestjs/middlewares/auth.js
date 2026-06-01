const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('Fatal: JWT_SECRET environment variable must be defined in production mode'); })() : 'inditrade_jwt_secret_key_2026');

function verifyToken(req, res, next) {
  let token = null;

  // 1. Try reading from cookie first
  if (req.cookies && req.cookies.inditrade_jwt_token) {
    token = req.cookies.inditrade_jwt_token;
  }

  // 2. Fall back to Authorization Bearer header
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing or not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired security token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: requires ${role} role authorization` });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  requireRole
};
