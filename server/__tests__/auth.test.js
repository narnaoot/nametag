const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app');
const db = require('../db');

// Reset all mocks between tests so they don't bleed across
beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  it('creates an unverified account + verification token, returns pending (no JWT)', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })                       // existence lookup: none
      .mockResolvedValueOnce({ rows: [{ id: 'user-uuid-1' }] })  // INSERT users RETURNING id
      .mockResolvedValueOnce({ rows: [] });                       // INSERT verification token

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, pending: true });
    expect(res.body).not.toHaveProperty('token');
    expect(db.query.mock.calls[1][0]).toMatch(/INSERT INTO users/);
    expect(db.query.mock.calls[2][0]).toMatch(/INSERT INTO email_verification_tokens/);
  });

  it('normalises the email to lowercase before looking up and inserting', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'user-uuid-2' }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'BOB@EXAMPLE.COM', password: 'password123' });

    expect(db.query.mock.calls[0][1][0]).toBe('bob@example.com'); // existence lookup
    expect(db.query.mock.calls[1][1][0]).toBe('bob@example.com'); // INSERT
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email and password required');
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'charlie@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email and password required');
  });

  it('returns 400 when both fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email and password required');
  });

  it('does not reveal that a verified email already exists (same pending response, no insert)', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 5, email_verified: true }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, pending: true });
    expect(db.query).toHaveBeenCalledTimes(1); // only the existence lookup — no user insert
  });

  it('re-registering an unverified account updates the password and resends verification', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 9, email_verified: false }] }) // existing unverified
      .mockResolvedValueOnce({ rows: [] })                                  // UPDATE password
      .mockResolvedValueOnce({ rows: [] });                                 // INSERT token

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'pending@example.com', password: 'newpassword1' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, pending: true });
    expect(db.query.mock.calls[1][0]).toMatch(/UPDATE users SET password_hash/);
    expect(db.query.mock.calls[2][0]).toMatch(/INSERT INTO email_verification_tokens/);
  });

  it('stays non-enumerating on a unique-constraint race (still 200 pending)', async () => {
    const pgUniqueError = Object.assign(new Error('duplicate key'), { code: '23505' });
    db.query
      .mockResolvedValueOnce({ rows: [] })       // existence lookup: none
      .mockRejectedValueOnce(pgUniqueError);      // INSERT users → concurrent duplicate

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'race@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, pending: true });
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Password must be at least 8 characters');
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 500 on unexpected database error', async () => {
    db.query.mockRejectedValueOnce(new Error('connection reset')); // existence lookup throws

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
  });

  it('stores a bcrypt hash, not the plain-text password', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'user-uuid-3' }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dave@example.com', password: 'mysecret1' });

    const storedHash = db.query.mock.calls[1][1][1]; // INSERT users params: [email, hash]
    expect(storedHash).not.toBe('mysecret1');
    const isValid = await bcrypt.compare('mysecret1', storedHash);
    expect(isValid).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with token and userId on valid credentials', async () => {
    const hash = await bcrypt.hash('correctpassword', 10);
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-10', email: 'eve@example.com', password_hash: hash, email_verified: true }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'eve@example.com', password: 'correctpassword' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId', 'user-uuid-10');

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.userId).toBe('user-uuid-10');
  });

  it('returns 403 with needsVerification when the email is not verified', async () => {
    const hash = await bcrypt.hash('correctpassword', 10);
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-x', email: 'unv@example.com', password_hash: hash, email_verified: false }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unv@example.com', password: 'correctpassword' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('needsVerification', true);
    expect(res.body).not.toHaveProperty('token');
  });

  it('returns 401 when user is not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('returns 401 when password is incorrect', async () => {
    const hash = await bcrypt.hash('realpassword', 10);
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-11', email: 'frank@example.com', password_hash: hash }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'frank@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'pass' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email and password required');
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email and password required');
  });

  it('normalises email to lowercase when querying', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'GRACE@EXAMPLE.COM', password: 'pass' });

    const queryArg = db.query.mock.calls[0][1][0];
    expect(queryArg).toBe('grace@example.com');
  });

  it('returns 500 on unexpected database error', async () => {
    db.query.mockRejectedValueOnce(new Error('db timeout'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pass' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 even when the email is not registered (no enumeration)', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // user lookup returns nothing

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('returns 200 and creates a token when the email exists', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })  // user lookup
      .mockResolvedValueOnce({ rows: [] });             // INSERT token

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    // Second db call should be the INSERT for the token
    expect(db.query.mock.calls[1][0]).toMatch(/INSERT INTO password_reset_tokens/);
  });

  it('stores only a SHA-256 hash of the reset token, never the raw value', async () => {
    const crypto = require('crypto');
    const raw = Buffer.alloc(32, 7);           // deterministic 32-byte token
    const rawHex = raw.toString('hex');        // what would go in the email link
    const bytesSpy = jest.spyOn(crypto, 'randomBytes').mockReturnValue(raw);

    db.query
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })  // user lookup
      .mockResolvedValueOnce({ rows: [] });             // INSERT token

    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@example.com' });

    const storedToken = db.query.mock.calls[1][1][1];  // INSERT params: [user_id, token, expires]
    const expectedHash = crypto.createHash('sha256').update(rawHex).digest('hex');
    expect(storedToken).toBe(expectedHash);
    expect(storedToken).not.toBe(rawHex);              // the raw value is never persisted

    bytesSpy.mockRestore();
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email required');
  });

  it('still returns 200 when the email send fails (no 500, no enumeration)', async () => {
    const nodemailer = require('nodemailer');
    const transportSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: jest.fn().mockRejectedValue(new Error('smtp down')),
    });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.SMTP_HOST = 'smtp.test'; // force makeTransport() to build a transport

    db.query
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })  // user lookup (email exists)
      .mockResolvedValueOnce({ rows: [] });             // INSERT token

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);

    delete process.env.SMTP_HOST;
    transportSpy.mockRestore();
    errSpy.mockRestore();
  });
});

describe('POST /api/auth/reset-password', () => {
  it('returns 400 when the token is invalid or expired', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // no matching token

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'badtoken', password: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Reset link is invalid or has expired');
  });

  it('returns 200 and updates the password on a valid token', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 7, user_id: 99 }] }) // token lookup
      .mockResolvedValueOnce({ rows: [] })                        // UPDATE password
      .mockResolvedValueOnce({ rows: [] });                       // UPDATE token used

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'validtoken123', password: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('looks up the reset token by its SHA-256 hash, not the raw value', async () => {
    const crypto = require('crypto');
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 7, user_id: 99 }] }) // token lookup
      .mockResolvedValueOnce({ rows: [] })                        // UPDATE password
      .mockResolvedValueOnce({ rows: [] });                       // UPDATE token used

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'raw-token-abc', password: 'newpassword123' });

    const lookupParam = db.query.mock.calls[0][1][0];
    const expectedHash = crypto.createHash('sha256').update('raw-token-abc').digest('hex');
    expect(lookupParam).toBe(expectedHash);
    expect(lookupParam).not.toBe('raw-token-abc');
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'sometoken', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Password must be at least 8 characters');
  });

  it('returns 400 when token or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'sometoken' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Token and password required');
  });
});

describe('POST /api/auth/verify-email', () => {
  it('returns 400 when token is missing', async () => {
    const res = await request(app).post('/api/auth/verify-email').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Token required');
  });

  it('returns 400 when the token is invalid or expired', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // no matching token
    const res = await request(app).post('/api/auth/verify-email').send({ token: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Verification link is invalid or has expired');
  });

  it('verifies the account and returns a JWT on a valid token', async () => {
    const crypto = require('crypto');
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 3, user_id: 77 }] }) // token lookup
      .mockResolvedValueOnce({ rows: [] })                        // UPDATE users verified
      .mockResolvedValueOnce({ rows: [] });                       // UPDATE token used

    const res = await request(app).post('/api/auth/verify-email').send({ token: 'good-token' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId', 77);
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.userId).toBe(77);

    // Looks the token up by its SHA-256 hash, not the raw value.
    const expectedHash = crypto.createHash('sha256').update('good-token').digest('hex');
    expect(db.query.mock.calls[0][1][0]).toBe(expectedHash);
    expect(db.query.mock.calls[1][0]).toMatch(/UPDATE users SET email_verified = TRUE/);
  });
});

describe('POST /api/auth/resend-verification', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/resend-verification').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email required');
  });

  it('returns 200 and issues a new token for an unverified account', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 12, email_verified: false }] }) // lookup
      .mockResolvedValueOnce({ rows: [] });                                  // INSERT token

    const res = await request(app).post('/api/auth/resend-verification').send({ email: 'u@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(db.query.mock.calls[1][0]).toMatch(/INSERT INTO email_verification_tokens/);
  });

  it('returns 200 without issuing a token when the account is already verified', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 12, email_verified: true }] });
    const res = await request(app).post('/api/auth/resend-verification').send({ email: 'v@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(db.query).toHaveBeenCalledTimes(1); // only the lookup
  });

  it('returns 200 without enumeration when the account does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post('/api/auth/resend-verification').send({ email: 'ghost@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});
