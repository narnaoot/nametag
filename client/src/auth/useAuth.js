import { createContext, useContext } from 'react';

// Auth context + hook live here (separate from the AuthProvider component) so
// AuthContext.jsx can export only a component — keeps React Fast Refresh happy.
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
