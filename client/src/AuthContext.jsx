import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nametag_token'));

  function signIn(newToken) {
    localStorage.setItem('nametag_token', newToken);
    setToken(newToken);
  }

  function signOut() {
    localStorage.removeItem('nametag_token');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
