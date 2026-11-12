const fs = require('fs');
const db = require('../db');
const { runCleanup } = require('../cleanup');

// The sweep that enforces what the server is allowed to keep. Query order:
// stale tags (SELECT [+ UPDATE]), ended parties (SELECT [+ UPDATE]), then three DELETEs.

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

const nothing = { rows: [], rowCount: 0 };
const sqlOf = (i) => db.query.mock.calls[i][0];

describe('runCleanup', () => {
  it('wipes tags nobody has refreshed in 30 minutes, and deletes their photos', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ user_id: 1, photo_path: '/uploads/a.jpg' }, { user_id: 2, photo_path: null }] })
      .mockResolvedValue(nothing);

    await runCleanup();

    expect(sqlOf(0)).toMatch(/COALESCE\(location_updated_at, updated_at\) < NOW\(\) - \$1::interval/);
    expect(db.query.mock.calls[0][1]).toEqual(['30 minutes']);
    expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
    expect(sqlOf(1)).toMatch(/display_name = NULL/);
    expect(sqlOf(1)).toMatch(/lat = NULL/);
    expect(sqlOf(1)).toMatch(/party_code = NULL/);
    expect(sqlOf(1)).not.toMatch(/always_visible/);   // leaving isn't choosing to hide
    expect(db.query.mock.calls[1][1]).toEqual([[1, 2]]);
  });

  it('ends parties after 4 hours by moving their members to invisible', async () => {
    db.query
      .mockResolvedValueOnce(nothing)                                             // stale
      .mockResolvedValueOnce({ rows: [{ user_id: 7, photo_path: '/uploads/p.jpg' }] })
      .mockResolvedValue(nothing);

    await runCleanup();

    expect(sqlOf(1)).toMatch(/party_code_set_at < NOW\(\) - \$1::interval/);
    expect(db.query.mock.calls[1][1]).toEqual(['4 hours']);
    expect(sqlOf(2)).toMatch(/always_visible = FALSE/);
    expect(fs.promises.unlink).toHaveBeenCalledWith(expect.stringContaining('p.jpg'));
  });

  it('deletes spent and expired email links, and sign-ups that never verified', async () => {
    db.query.mockResolvedValue(nothing);

    await runCleanup();

    const all = db.query.mock.calls.map(c => c[0]).join('\n');
    expect(all).toMatch(/DELETE FROM password_reset_tokens WHERE used = TRUE OR expires_at < NOW\(\)/);
    expect(all).toMatch(/DELETE FROM email_verification_tokens WHERE used = TRUE OR expires_at < NOW\(\)/);
    expect(all).toMatch(/DELETE FROM users WHERE email_verified = FALSE AND created_at < NOW\(\) - \$1::interval/);
  });

  it('keeps going when one step fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    db.query.mockRejectedValueOnce(new Error('db down')).mockResolvedValue(nothing);

    await expect(runCleanup()).resolves.toBeUndefined();
    expect(db.query.mock.calls.length).toBeGreaterThanOrEqual(5);
  });
});
