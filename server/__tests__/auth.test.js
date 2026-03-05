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
  it('returns 201 with a token and userId on successful registration', async () => {
    // db.query is called once: INSERT ... RETURNING id, email
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-1', email: 'alice@example.com' }],
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId', 'user-uuid-1');

    // Verify the token is valid and carries the correct userId
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.userId).toBe('user-uuid-1');
  });

  it('normalises the email to lowercase before inserting', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-2', email: 'bob@example.com' }],
    });

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'BOB@EXAMPLE.COM', password: 'pass' });

    // The first argument to db.query should contain the lowercased email
    const callArgs = db.query.mock.calls[0];
    expect(callArgs[1][0]).toBe('bob@example.com');
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

  it('returns 409 on duplicate email (unique constraint violation)', async () => {
    const pgUniqueError = Object.assign(new Error('duplicate key'), { code: '23505' });
    db.query.mockRejectedValueOnce(pgUniqueError);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@example.com', password: 'pass' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Email already in use');
  });

  it('returns 500 on unexpected database error', async () => {
    db.query.mockRejectedValueOnce(new Error('connection reset'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'pass' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
  });

  it('stores a bcrypt hash, not the plain-text password', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-3', email: 'dave@example.com' }],
    });

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dave@example.com', password: 'mysecret' });

    const storedHash = db.query.mock.calls[0][1][1];
    expect(storedHash).not.toBe('mysecret');
    const isValid = await bcrypt.compare('mysecret', storedHash);
    expect(isValid).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with token and userId on valid credentials', async () => {
    const hash = await bcrypt.hash('correctpassword', 10);
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-10', email: 'eve@example.com', password_hash: hash }],
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
