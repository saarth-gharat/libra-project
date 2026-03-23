import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext useEffect - checking token and user');
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Saved user:', savedUser ? 'Present' : 'Missing');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Setting user from localStorage:', parsedUser);
        setUser(parsedUser);
        
        api.get('/auth/me')
          .then((res) => {
            console.log('API response user:', res.data.user);
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          })
          .catch((error) => {
            console.log('API error, logging out:', error);
            logout();
          })
          .finally(() => {
            console.log('Setting loading to false');
            setLoading(false);
          });
      } catch (error) {
        console.log('Error parsing user, logging out:', error);
        logout();
        setLoading(false);
      }
    } else {
      console.log('No token or user found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log('AuthContext login called with:', email);
    const res = await api.post('/auth/login', { email, password });
    console.log('API response:', res.data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    
    // For email verification, we don't automatically log in
    // The response contains a success message instead of token
    if (res.data.token) {
      // This would be for immediate login (if we want to bypass verification)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    
    return res.data;
  };

  const logout = () => {
    console.log('Logout initiated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('User state cleared, redirecting to login');
    // Force a small delay to ensure state updates before redirect
    setTimeout(() => {
      window.location.href = '/login';
    }, 10);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
