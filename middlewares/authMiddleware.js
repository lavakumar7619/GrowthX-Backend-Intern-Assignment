const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Access denied, no token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next(); 
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied, admin privileges required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
