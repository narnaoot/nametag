// In native Capacitor builds, there's no dev-server proxy, so we need the full URL.
// Set VITE_API_URL in .env.production to your Render backend URL.
const BASE = import.meta.env.VITE_API_URL || '/api';

// On native iOS, /uploads/... paths must be absolute Render URLs.
// On web, Vercel rewrites /uploads/... to Render for us.
const UPLOAD_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
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
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function register(email, password) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function getMyProfile() {
  return request('/profiles/me');
}

export async function updateProfile(formData) {
  return request('/profiles/me', { method: 'PUT', body: formData });
}

export async function updateLocation(latitude, longitude) {
  return request('/profiles/me/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude }),
  });
}

export async function setVisibility(is_active) {
  return request('/profiles/me/visibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active }),
  });
}

export async function getNearby() {
  return request('/profiles/nearby');
}

export async function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, password) {
  return request('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
}
