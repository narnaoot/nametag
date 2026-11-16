// Shared plumbing for the integration tests: a clean database, real sign-ups,
// and small wrappers so each test reads as "who does what".
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const migrate = require('../../db/migrate');

const UPLOADS = path.join(__dirname, '../../uploads');
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

// Email links are written to the log (no mail provider in tests); catch them here.
let logged = '';
let logSpy;

async function resetDatabase() {
  await db.query(`DROP TABLE IF EXISTS email_verification_tokens, password_reset_tokens, profiles, users CASCADE`);
  await db.query(fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8'));
  await migrate();
}

function startCapturingLogs() {
  logSpy = jest.spyOn(console, 'log').mockImplementation((...args) => { logged += args.join(' ') + '\n'; });
}
function stopCapturingLogs() { logSpy?.mockRestore(); }

// The most recent emailed link of a kind ('verify' | 'reset').
function lastLink(kind) {
  const all = logged.match(new RegExp(`${kind}=[0-9a-f]+`, 'g'));
  if (!all) throw new Error(`no ${kind} link was logged`);
  return all[all.length - 1].split('=')[1];
}

const post = (url, body, token) => {
  const r = request(app).post(url);
  if (token) r.set('Authorization', `Bearer ${token}`);
  return r.send(body);
};
const get = (url, token) => request(app).get(url).set('Authorization', `Bearer ${token}`);
const del = (url, token) => request(app).delete(url).set('Authorization', `Bearer ${token}`);

// Sign up through the real endpoints and return a signed-in person.
async function signUp(email, password = 'password1') {
  await post('/api/auth/register', { email, password });
  const res = await post('/api/auth/verify-email', { token: lastLink('verify') });
  return { email, token: res.body.token, userId: res.body.userId };
}

// Save a tag (multipart, like the app). `photo` attaches a file.
function saveTag(person, fields = {}, photo) {
  const r = request(app).put('/api/profiles/me').set('Authorization', `Bearer ${person.token}`);
  const all = { display_name: 'Someone', pronouns: 'they/them', ...fields };
  for (const [k, v] of Object.entries(all)) r.field(k, String(v));
  if (photo) r.attach('photo', photo.buffer ?? PNG, { filename: photo.filename ?? 'me.png', contentType: photo.type ?? 'image/png' });
  return r;
}

const HERE = { latitude: 37.774929512, longitude: -122.419415534 };
const share = (person, where = HERE) => post('/api/profiles/me/location', where, person.token);
const nearbyNames = async (person) => (await get('/api/profiles/nearby', person.token)).body.map(p => p.display_name).sort();

// A person with a tag who is on the wall at HERE.
async function arrive(email, name, fields = {}) {
  const person = await signUp(email);
  await saveTag(person, { display_name: name, ...fields });
  await share(person);
  return person;
}

async function row(person) {
  const { rows } = await db.query('SELECT * FROM profiles WHERE user_id = $1', [person.userId]);
  return rows[0];
}
const backdate = (person, column, interval) =>
  db.query(`UPDATE profiles SET ${column} = NOW() - $2::interval WHERE user_id = $1`, [person.userId, interval]);

const photoOnDisk = (photoPath) => !!photoPath && fs.existsSync(path.join(UPLOADS, path.basename(photoPath)));
function removeUploads() {
  for (const f of fs.readdirSync(UPLOADS)) if (f !== '.gitkeep') fs.unlinkSync(path.join(UPLOADS, f));
}

module.exports = {
  app, db, PNG, HERE, resetDatabase, startCapturingLogs, stopCapturingLogs, lastLink,
  post, get, del, signUp, saveTag, share, nearbyNames, arrive, row, backdate, photoOnDisk, removeUploads,
};
