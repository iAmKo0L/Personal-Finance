const jwt = require('jsonwebtoken');
const config = require('../config');
function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Unauthorized' });
  try { req.user = jwt.verify(token, config.jwtSecret); return next(); }
  catch (e) { return res.status(401).json({ message: 'Invalid token' }); }
}
module.exports = { requireAuth };

