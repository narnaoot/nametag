const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../db');

// Helper: generate a valid Bearer token for a given userId
function makeToken(userId = 'user-test-id') {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
}

function authHeader(userId) {
  return `Bearer ${makeToken(userId)}`;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/profiles/me
// ---------------------------------------------------------------------------
describe('GET /api/profiles/me', () => {
  it('returns the profile for the authenticated user', async () => {
    const fakeProfile = {
      id: 'profile-1',
      user_id: 'user-test-id',
      display_name: 'Alice',
      pronouns: 'she/her',
    };
    db.query.mockResolvedValueOnce({ rows: [fakeProfile] });

    const res = await request(app)
      .get('/api/profiles/me')
      .set('Authorization', authHeader('user-test-id'));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ display_name: 'Alice', pronouns: 'she/her' });
  });

  it('returns null when the user has no profile yet', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/profiles/me')
      .set('Authorization', authHeader('user-no-profile'));

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/profiles/me');
    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/profiles/me')
      .set('Authorization', 'Bearer bad.token.value');
    expect(res.status).toBe(401);
  });

  it('returns 500 on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));

    const res = await request(app)
      .get('/api/profiles/me')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
  });
});

// ---------------------------------------------------------------------------
// PUT /api/profiles/me
// ---------------------------------------------------------------------------
describe('PUT /api/profiles/me', () => {
  const updatedProfile = {
    id: 'profile-2',
    user_id: 'user-put-id',
    display_name: 'Bob',
    pronouns: 'he/him',
    radius_meters: 200,
    always_visible: true,
  };

  it('creates a new profile when none exists and returns it', async () => {
    // 1st query: SELECT existing profile → none
    db.query.mockResolvedValueOnce({ rows: [] });
    // 2nd query: INSERT
    db.query.mockResolvedValueOnce({ rows: [] });
    // 3rd query: SELECT updated profile
    db.query.mockResolvedValueOnce({ rows: [updatedProfile] });

    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader('user-put-id'))
      .field('display_name', 'Bob')
      .field('pronouns', 'he/him')
      .field('radius_meters', '200')
      .field('always_visible', 'true');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ display_name: 'Bob', pronouns: 'he/him' });
  });

  it('updates an existing profile and returns it', async () => {
    // 1st query: SELECT existing profile → found
    db.query.mockResolvedValueOnce({ rows: [{ id: 'profile-2', photo_path: null }] });
    // 2nd query: UPDATE
    db.query.mockResolvedValueOnce({ rows: [] });
    // 3rd query: SELECT updated profile
    db.query.mockResolvedValueOnce({ rows: [updatedProfile] });

    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader('user-put-id'))
      .field('display_name', 'Bob')
      .field('pronouns', 'he/him');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('display_name', 'Bob');
  });

  it('returns 400 when display_name is missing', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('pronouns', 'they/them');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Name and pronouns required');
  });

  it('returns 400 when pronouns are missing', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', 'Carol');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Name and pronouns required');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .field('display_name', 'Carol')
      .field('pronouns', 'she/her');

    expect(res.status).toBe(401);
  });

  it('returns 400 when display_name is only whitespace', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', '   ')
      .field('pronouns', 'they/them');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Name and pronouns required');
  });

  it('returns 400 when pronouns is only whitespace', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', 'Test')
      .field('pronouns', '   ');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Name and pronouns required');
  });

  it('stores trimmed display_name and pronouns', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // SELECT existing
    db.query.mockResolvedValueOnce({ rows: [] }); // INSERT
    db.query.mockResolvedValueOnce({ rows: [{ display_name: 'Alex', pronouns: 'they/them' }] });

    await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', '  Alex  ')
      .field('pronouns', '  they/them  ');

    const insertArgs = db.query.mock.calls[1][1];
    expect(insertArgs[1]).toBe('Alex');
    expect(insertArgs[2]).toBe('they/them');
  });

  it('returns 400 when photo is not an image', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', 'Test')
      .field('pronouns', 'they/them')
      .attach('photo', Buffer.from('not an image'), {
        filename: 'doc.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Only image files are allowed');
  });

  it('returns 400 when photo exceeds 5 MB', async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024, 'x');

    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', 'Test')
      .field('pronouns', 'they/them')
      .attach('photo', bigBuffer, {
        filename: 'big.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Photo must be under 5 MB');
  });

  it('defaults radius_meters to 100 when not provided', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // SELECT existing
    db.query.mockResolvedValueOnce({ rows: [] }); // INSERT
    db.query.mockResolvedValueOnce({ rows: [{ radius_meters: 100 }] }); // SELECT result

    await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', 'Dave')
      .field('pronouns', 'he/him');

    // The 2nd call is the INSERT; check the radius_meters argument (index 4)
    const insertArgs = db.query.mock.calls[1][1];
    expect(insertArgs[4]).toBe(100);
  });

  it('treats always_visible="false" as false', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // SELECT existing
    db.query.mockResolvedValueOnce({ rows: [] }); // INSERT
    db.query.mockResolvedValueOnce({ rows: [{ always_visible: false }] }); // SELECT result

    await request(app)
      .put('/api/profiles/me')
      .set('Authorization', authHeader())
      .field('display_name', 'Eve')
      .field('pronouns', 'she/her')
      .field('always_visible', 'false');

    const insertArgs = db.query.mock.calls[1][1];
    expect(insertArgs[5]).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// POST /api/profiles/me/location
// ---------------------------------------------------------------------------
describe('POST /api/profiles/me/location', () => {
  it('updates location and returns ok:true', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/profiles/me/location')
      .set('Authorization', authHeader())
      .send({ latitude: 37.7749, longitude: -122.4194 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('passes latitude as 2nd param and longitude as 3rd param to the query', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .post('/api/profiles/me/location')
      .set('Authorization', authHeader('user-loc'))
      .send({ latitude: 40.7128, longitude: -74.006 });

    const args = db.query.mock.calls[0][1];
    // args: [userId, latitude, longitude]
    expect(args[1]).toBe(40.7128);   // latitude ($2)
    expect(args[2]).toBe(-74.006);   // longitude ($3)
  });

  it('returns 400 when latitude is missing', async () => {
    const res = await request(app)
      .post('/api/profiles/me/location')
      .set('Authorization', authHeader())
      .send({ longitude: -122.4194 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'latitude and longitude required');
  });

  it('returns 400 when longitude is missing', async () => {
    const res = await request(app)
      .post('/api/profiles/me/location')
      .set('Authorization', authHeader())
      .send({ latitude: 37.7749 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'latitude and longitude required');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/profiles/me/location')
      .send({ latitude: 0, longitude: 0 });

    expect(res.status).toBe(401);
  });

  it('returns 500 on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('query failed'));

    const res = await request(app)
      .post('/api/profiles/me/location')
      .set('Authorization', authHeader())
      .send({ latitude: 1, longitude: 1 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
  });
});

// ---------------------------------------------------------------------------
// POST /api/profiles/me/visibility
// ---------------------------------------------------------------------------
describe('POST /api/profiles/me/visibility', () => {
  it('sets is_active to true and returns ok:true', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/profiles/me/visibility')
      .set('Authorization', authHeader())
      .send({ is_active: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const args = db.query.mock.calls[0][1];
    expect(args[1]).toBe(true);
  });

  it('sets is_active to false and returns ok:true', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/profiles/me/visibility')
      .set('Authorization', authHeader())
      .send({ is_active: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const args = db.query.mock.calls[0][1];
    expect(args[1]).toBe(false);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/profiles/me/visibility')
      .send({ is_active: true });

    expect(res.status).toBe(401);
  });

  it('returns 500 on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('db error'));

    const res = await request(app)
      .post('/api/profiles/me/visibility')
      .set('Authorization', authHeader())
      .send({ is_active: true });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
  });
});

// ---------------------------------------------------------------------------
// GET /api/profiles/nearby
// ---------------------------------------------------------------------------
describe('GET /api/profiles/nearby', () => {
  const fakeNearbyProfiles = [
    { id: 'p-1', display_name: 'Nearby Person', pronouns: 'they/them', distance_meters: 50 },
  ];

  it('returns nearby profiles when user has a location set', async () => {
    // 1st query: get user's own profile (lat, lng, radius)
    db.query.mockResolvedValueOnce({
      rows: [{ lat: 37.7749, lng: -122.4194, radius_meters: 300 }],
    });
    // 2nd query: get nearby profiles (Haversine subquery)
    db.query.mockResolvedValueOnce({ rows: fakeNearbyProfiles });

    const res = await request(app)
      .get('/api/profiles/nearby')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('display_name', 'Nearby Person');
  });

  it('returns an empty array when no profiles are nearby', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ lat: 37.7749, lng: -122.4194, radius_meters: 100 }],
    });
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/profiles/nearby')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 200 when user is at lat=0, lng=0 (valid coordinates, not treated as missing)', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ lat: 0, lng: 0, radius_meters: 100 }],
    });
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/profiles/nearby')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 400 when user has no location set', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ lat: null, lng: null, radius_meters: 100 }] });

    const res = await request(app)
      .get('/api/profiles/nearby')
      .set('Authorization', authHeader());

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Share your location first');
  });

  it('returns 400 when user has no profile at all', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/profiles/nearby')
      .set('Authorization', authHeader());

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Share your location first');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/profiles/nearby');
    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    // First query (get own profile) succeeds, second (nearby search) fails
    db.query.mockResolvedValueOnce({
      rows: [{ lat: 37.7749, lng: -122.4194, radius_meters: 100 }],
    });
    db.query.mockRejectedValueOnce(new Error('db exploded'));

    const res = await request(app)
      .get('/api/profiles/nearby')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
  });

  it('passes the correct userId to exclude the requesting user from results', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ lat: 40.7128, lng: -74.006, radius_meters: 500 }],
    });
    db.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get('/api/profiles/nearby')
      .set('Authorization', authHeader('specific-user-id'));

    // 2nd db.query call is the Haversine nearby search; args[2] = userId to exclude
    const nearbyQueryArgs = db.query.mock.calls[1][1];
    expect(nearbyQueryArgs[2]).toBe('specific-user-id');
  });
});
