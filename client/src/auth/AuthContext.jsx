import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { setToken as setApiToken, setUnauthorizedHandler, deleteAccount as deleteAccountApi } from '../lib/api';
import { AuthContext } from './useAuth';

const TOKEN_KEY = 'nametag_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Preferences is async, so load the token before rendering children
  useEffect(() => {
    Preferences.get({ key: TOKEN_KEY }).then(({ value }) => {
      setToken(value);
      setApiToken(value);
      setReady(true);
    });
  }, []);

  // If the server rejects our token (expired or revoked), clear it so the app
  // falls back to the sign-in screen instead of looping on a dead session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      Preferences.remove({ key: TOKEN_KEY });
      setToken(null);
      setApiToken(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function signIn(newToken) {
    await Preferences.set({ key: TOKEN_KEY, value: newToken });
    setToken(newToken);
    setApiToken(newToken);
  }

  async function signOut() {
    await Preferences.remove({ key: TOKEN_KEY });
    setToken(null);
    setApiToken(null);
  }

  async function deleteAccount() {
    await deleteAccountApi();
    await Preferences.remove({ key: TOKEN_KEY });
    setToken(null);
    setApiToken(null);
  }

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
