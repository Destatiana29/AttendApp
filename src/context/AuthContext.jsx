import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and manages:
 * - `user`      : the currently logged-in user object (or null)
 * - `isLoading` : true while restoring session from localStorage on first mount
 * - `allUsers`  : all DummyJSON users, set once after successful login (shared globally)
 *
 * `allUsers` is populated by LoginPage after fetching /users and stored here
 * so PersonalPage / StudentsPage can read it without re-fetching.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState(null);

  // Restore user session from localStorage on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('instructor_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('instructor_user');
      }
    }
    setIsLoading(false);
  }, []);

  /** Called by LoginPage after successful credential match. */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('instructor_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setAllUsers(null);
    localStorage.removeItem('instructor_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, allUsers, setAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook for consuming AuthContext — throws if used outside AuthProvider. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
