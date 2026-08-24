const jwt = require('jsonwebtoken');
const currentTokenVersion = require('./tokenVersion');

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = header.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Revocation check: the token's version must match the account's current
  // token_version. Bumping token_version (e.g. on a password reset) invalidates
  // every token issued before it. A missing user (deleted account) also fails.
  let version;
  try {
    version = await currentTokenVersion(payload.userId);
  } catch (err) {
    return next(err); // unexpected DB error → 500 via the global handler
  }
  if (version === null || (payload.tv ?? 0) !== version) {
    return res.status(401).json({ error: 'Session expired — please sign in again' });
  }

  req.user = payload;
  next();
};
