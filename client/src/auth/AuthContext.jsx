import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { setToken as setApiToken, setUnauthorizedHandler, deleteAccount as deleteAccountApi } from '../lib/api';
import { AuthContext } from './useAuth';
import { claimLocalData, clearLocalData } from '../lib/profileStorage';

// The account id inside a JWT (unverified read — only used to label which
// account the on-device data belongs to).
function userIdOf(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part)).userId ?? null;
  } catch { return null; }
}

const TOKEN_KEY = 'nametag_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Preferences is async, so load the token before rendering children
  useEffect(() => {
    Preferences.get({ key: TOKEN_KEY }).then(async ({ value }) => {
      if (value) await claimLocalData(userIdOf(value));
      setToken(value);
      setApiToken(value);
      setReady(true);
    });
  }, []);

  // Forget the token everywhere it's held: storage, React state, the API client.
  async function signOut() {
    await Preferences.remove({ key: TOKEN_KEY });
    setToken(null);
    setApiToken(null);
  }

  // If the server rejects our token (expired or revoked), drop it so the app
  // falls back to the sign-in screen instead of looping on a dead session.
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, []);

  async function signIn(newToken) {
    // A different account on this device must not inherit the last one's tag.
    await claimLocalData(userIdOf(newToken), { fresh: true });
    await Preferences.set({ key: TOKEN_KEY, value: newToken });
    setToken(newToken);
    setApiToken(newToken);
  }

  async function deleteAccount() {
    await deleteAccountApi();
    await clearLocalData();   // "everything is erased" includes this device
    await signOut();
  }

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
