import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContextDef';
import { apiRequest, AUTH_TOKEN_KEY } from '../lib/api';

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return undefined;

    let active = true;
    apiRequest('/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        localStorage.removeItem(AUTH_TOKEN_KEY);
        console.error('Could not restore the saved sign-in session.', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const login = async (email, password, { isAdmin = false, isRegister = false, name = '' } = {}) => {
    if (isRegister) {
      const { token, user: registeredUser } = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      setUser(registeredUser);
      return registeredUser;
    }

    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    const { token, user: signedInUser } = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(signedInUser);
    return signedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
