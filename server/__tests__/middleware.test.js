const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth middleware', () => {
  it('calls next() and attaches req.user when a valid, current token is provided', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ token_version: 0 }] });
    const token = jwt.sign({ userId: 'user-abc', tv: 0 }, process.env.JWT_SECRET);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('user-abc');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('treats a token with no tv claim as version 0 (back-compat with pre-M3 tokens)', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ token_version: 0 }] });
    const token = jwt.sign({ userId: 'legacy-user' }, process.env.JWT_SECRET);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when the token version is stale (revoked)', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ token_version: 3 }] });
    const token = jwt.sign({ userId: 'u', tv: 1 }, process.env.JWT_SECRET);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when the user no longer exists (deleted account)', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const token = jwt.sign({ userId: 'ghost', tv: 0 }, process.env.JWT_SECRET);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('forwards an unexpected DB error to next() (→ 500), not a 401', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const token = jwt.sign({ userId: 'u', tv: 0 }, process.env.JWT_SECRET);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header is missing entirely', async () => {
    const { req, res, next } = makeReqRes(undefined);

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with "Bearer "', async () => {
    const { req, res, next } = makeReqRes('Token abc123');

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
  });

  it('returns 401 when Authorization header is just "Bearer" with no token', async () => {
    const { req, res, next } = makeReqRes('Bearer');

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token is signed with the wrong secret', async () => {
    const token = jwt.sign({ userId: 'user-xyz' }, 'wrong-secret');
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 401 when token is malformed/garbage', async () => {
    const { req, res, next } = makeReqRes('Bearer this.is.not.a.jwt');

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 when token is expired', async () => {
    const token = jwt.sign({ userId: 'user-exp' }, process.env.JWT_SECRET, {
      expiresIn: -1, // already expired
    });
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 when Authorization header is an empty string', async () => {
    const { req, res, next } = makeReqRes('');

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
  });
});
