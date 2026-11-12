const request = require('supertest');
const app = require('../app');

// Covers the security middleware added in app.js: helmet headers (L4) and the
// CORS allowlist (L2). /api/health is a no-op JSON route that doesn't touch the
// (mocked) database, so it's a clean probe for response headers.

describe('security middleware', () => {
  describe('helmet headers (L4)', () => {
    it('sets X-Content-Type-Options: nosniff', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('sets a cross-origin resource policy so the frontend can load /uploads photos', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
    });

    it('does not advertise the Express framework', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CORS allowlist (L2)', () => {
    it('reflects an allowed production origin', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://nametag.n4bil.com');
      expect(res.headers['access-control-allow-origin']).toBe('https://nametag.n4bil.com');
    });

    it('allows Vercel preview deployments', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://nametag-git-feature-x.vercel.app');
      expect(res.headers['access-control-allow-origin']).toBe('https://nametag-git-feature-x.vercel.app');
    });

    it('allows the native (Capacitor) origin', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'capacitor://localhost');
      expect(res.headers['access-control-allow-origin']).toBe('capacitor://localhost');
    });

    it('sends no CORS headers for a disallowed origin', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://evil.example.com');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Auth throttling. The limiters are switched off under NODE_ENV=test, so these
// tests turn them on for their own requests.
// ---------------------------------------------------------------------------
describe('auth rate limiting', () => {
  const db = require('../db');
  const post = (path, body) => request(app).post(path).send(body);
  let savedEnv;

  beforeEach(() => {
    savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'rate-limit-test';
    db.query.mockReset();
    db.query.mockResolvedValue({ rows: [] });   // no such user
  });
  afterEach(() => { process.env.NODE_ENV = savedEnv; });

  it('stops password guessing against one account, without blocking anyone else', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await post('/api/auth/login', { email: 'victim@example.com', password: `guess-${i}` });
      expect(res.status).toBe(401);
    }
    const blocked = await post('/api/auth/login', { email: 'Victim@Example.com ', password: 'one more' });
    expect(blocked.status).toBe(429);

    // someone else on the same network (same IP) is unaffected
    const other = await post('/api/auth/login', { email: 'neighbour@example.com', password: 'whatever1' });
    expect(other.status).toBe(401);
  });

  it('lets a whole room sign in from one IP', async () => {
    for (let i = 0; i < 60; i++) {
      const res = await post('/api/auth/login', { email: `guest${i}@example.com`, password: 'password1' });
      expect(res.status).toBe(401);   // wrong password, but never 429
    }
  });

  it('stops one address being flooded with emails', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await post('/api/auth/forgot-password', { email: 'inbox@example.com' });
      expect(res.status).toBe(200);
    }
    const blocked = await post('/api/auth/forgot-password', { email: 'inbox@example.com' });
    expect(blocked.status).toBe(429);
    // …and the limit is shared across the endpoints that send email
    const resend = await post('/api/auth/resend-verification', { email: 'inbox@example.com' });
    expect(resend.status).toBe(429);
  });
});
