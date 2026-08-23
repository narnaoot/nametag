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
