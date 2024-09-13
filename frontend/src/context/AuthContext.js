// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:3001/user/login', {
        username,
        password,
      });
      const { token } = response.data;
      const decoded = jwtDecode(token);
      setUser(decoded);
      localStorage.setItem('token', token);
      setError(null); // Clear error on successful login
    } catch (error) {
      setError('Invalid credentials'); // Set error message for login failure
      throw new Error('Invalid credentials');
    }
  };

  const register = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:3001/user/register', {
        username,
        password,
      });
      console.log(response.data);
      setError(null); // Clear error on successful registration

      // Automatically log in the user after successful registration
      const loginResponse = await axios.post('http://localhost:3001/user/login', {
        username,
        password,
      });
      const { token } = loginResponse.data;
      const decoded = jwtDecode(token);
      setUser(decoded);
      localStorage.setItem('token', token);

      return true; // Indicate success
    } catch (error) {
      if (error.response && error.response.data.message === 'Username already taken') {
        setError('Username already taken'); // Set error message for duplicate username
      } else {
        setError('Registration failed'); // Set a generic error message for other failures
      }
      return false; // Indicate failure
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
