import { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'nametag_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Preferences is async, so load the token before rendering children
  useEffect(() => {
    Preferences.get({ key: TOKEN_KEY }).then(({ value }) => {
      setToken(value);
      setReady(true);
    });
  }, []);

  async function signIn(newToken) {
    await Preferences.set({ key: TOKEN_KEY, value: newToken });
    setToken(newToken);
  }

  async function signOut() {
    await Preferences.remove({ key: TOKEN_KEY });
    setToken(null);
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
