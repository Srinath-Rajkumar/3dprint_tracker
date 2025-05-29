import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService'; // You'll create this

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user) {
      setUserInfo(user);
      // Optionally: verify token with backend here
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data; // Return data to check for requiresInitialSetup
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout(); // Clears localStorage
    setUserInfo(null);
  };
  
  // Add updateUser function
  const updateUser = (updatedData) => {
    const newInfo = { ...userInfo, ...updatedData };
    setUserInfo(newInfo);
    localStorage.setItem('userInfo', JSON.stringify(newInfo));
  };


  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;