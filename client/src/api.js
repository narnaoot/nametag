// In native Capacitor builds, there's no dev-server proxy, so we need the full URL.
// Set VITE_API_URL in .env.production to your Render backend URL (e.g. https://nametag.onrender.com/api).
const BASE = import.meta.env.VITE_API_URL || '/api';

// On native iOS, /uploads/... paths must be absolute Render URLs.
// On web, Vercel rewrites /uploads/... to Render for us.
// Derive origin by stripping the trailing /api path segment (anchored, not substring).
const UPLOAD_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : '';
export function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${UPLOAD_BASE}${path}`;
}

// Token is kept in sync by AuthContext via setToken() below.
// Do NOT read from localStorage — on iOS, AuthContext uses @capacitor/preferences.
let _token = null;
export function setToken(t) { _token = t; }
function getToken() { return _token; }

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.data = data; // carry flags like needsVerification to the caller
    throw err;
  }
  return data;
}

// POST a JSON body. Multipart (FormData) endpoints use request() directly so
// the browser sets its own Content-Type + boundary.
function postJson(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function register(email, password) {
  return postJson('/auth/register', { email, password });
}

export function login(email, password) {
  return postJson('/auth/login', { email, password });
}

export function verifyEmail(token) {
  return postJson('/auth/verify-email', { token });
}

export function resendVerification(email) {
  return postJson('/auth/resend-verification', { email });
}

export function getMyProfile() {
  return request('/profiles/me');
}

export function updateProfile(formData) {
  return request('/profiles/me', { method: 'PUT', body: formData });
}

export function updateLocation(latitude, longitude) {
  return postJson('/profiles/me/location', { latitude, longitude });
}

export function setVisibility(is_active) {
  return postJson('/profiles/me/visibility', { is_active });
}

export function getNearby() {
  return request('/profiles/nearby');
}

export function uploadPhoto(photoFile) {
  const fd = new FormData();
  fd.append('photo', photoFile);
  return request('/profiles/me/photo', { method: 'POST', body: fd });
}

export function deleteAccount() {
  return request('/profiles/me', { method: 'DELETE' });
}

export function forgotPassword(email) {
  return postJson('/auth/forgot-password', { email });
}

export function resetPassword(token, password) {
  return postJson('/auth/reset-password', { token, password });
}
