import { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { setToken as setApiToken } from './api';

const TOKEN_KEY = 'nametag_token';
const AuthContext = createContext(null);

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

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
