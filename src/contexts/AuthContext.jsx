import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data and token on mount
    const userData = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('authToken');

    if (userData && storedToken) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.role === 'contractor') {
        localStorage.setItem('user_cont', JSON.stringify(parsedUser));
        }
        if (parsedUser.role === 'worker') {
          localStorage.setItem('user_work', JSON.stringify(parsedUser));
        }
        if (parsedUser.role === 'builder') {
          localStorage.setItem('user_build', JSON.stringify(parsedUser));
        }

        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing user data or setting token:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role
      });

      const { user: userData, token: newToken } = response.data;

      // Store both user data and token
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('authToken', newToken);

      setUser(userData);
      if (userData.role === 'contractor') {
        localStorage.setItem('user_cont', JSON.stringify(userData));
        }
        if (userData.role === 'worker') {
          localStorage.setItem('user_work', JSON.stringify(userData));
        }
        if (userData.role === 'builder') {
          localStorage.setItem('user_build', JSON.stringify(userData));
        }
      setToken(newToken);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 