const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Helper to build mock req/res/next objects
function makeReqRes(authHeader) {
  const req = { headers: {} };
  if (authHeader !== undefined) {
    req.headers.authorization = authHeader;
  }

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const next = jest.fn();
  return { req, res, next };
}

describe('Auth middleware', () => {
  it('calls next() and attaches req.user when a valid token is provided', () => {
    const token = jwt.sign({ userId: 'user-abc' }, process.env.JWT_SECRET);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('user-abc');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header is missing entirely', () => {
    const { req, res, next } = makeReqRes(undefined);

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
  });

  it('returns 401 when Authorization header does not start with "Bearer "', () => {
    const { req, res, next } = makeReqRes('Token abc123');

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
  });

  it('returns 401 when Authorization header is just "Bearer" with no token', () => {
    const { req, res, next } = makeReqRes('Bearer');

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token is signed with the wrong secret', () => {
    const token = jwt.sign({ userId: 'user-xyz' }, 'wrong-secret');
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 when token is malformed/garbage', () => {
    const { req, res, next } = makeReqRes('Bearer this.is.not.a.jwt');

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 when token is expired', () => {
    const token = jwt.sign({ userId: 'user-exp' }, process.env.JWT_SECRET, {
      expiresIn: -1, // already expired
    });
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 when Authorization header is an empty string', () => {
    const { req, res, next } = makeReqRes('');

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
  });
});
