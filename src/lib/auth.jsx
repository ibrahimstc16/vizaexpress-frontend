/* eslint-disable react-refresh/only-export-components -- provider and its hook live together */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi, session, setUnauthorizedHandler } from '../services/api';
import { PageSpinner } from '../components/ui/Spinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (session.getToken() ? session.getUser() : null));
  const [checking, setChecking] = useState(() => !!session.getToken());
  const [expired, setExpired] = useState(false);

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setExpired(true);
    });
    if (!session.getToken()) return undefined;

    // Refresh the stored profile (and admin flag) from the server on load.
    let active = true;
    authApi.me()
      .then(({ data }) => {
        if (!active) return;
        session.save(session.getToken(), data.user);
        setUser(data.user);
      })
      .catch(() => {
        // 401 is handled by the interceptor; on network errors keep the cached user.
      })
      .finally(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback((token, profile) => {
    session.save(token, profile);
    setUser(profile);
    setExpired(false);
  }, []);

  const value = useMemo(
    () => ({ user, checking, expired, signIn, logout, clearExpired: () => setExpired(false) }),
    [user, checking, expired, signIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function RequireAuth({ children, admin = false }) {
  const { user, checking, expired } = useAuth();
  const location = useLocation();

  if (checking) return <PageSpinner />;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}${expired ? '&expired=1' : ''}`} replace />;
  }
  if (admin && !user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
