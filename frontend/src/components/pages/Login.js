import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './Login.css'; // Import the new CSS file

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null); // State for tracking login errors
  const { user, login, logout } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Attempting to log in with username:', username);

    try {
      await login(username, password);
      console.log('Login successful');
      setLoginError(null); // Clear any previous error
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Wrong username or password'); // Set error message
    }
  };

  const handleLogout = () => {
    console.log('Logging out');
    logout();
  };

  return (
    <div className="login-container">
      {user ? (
        <div className="login-form">
          <h2 className="welcome-message">Welcome, {user.username}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="login-form">
          <h1>Login</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
          {loginError && <p className="error-message">{loginError}</p>} {/* Display error message */}
        </form>
      )}
    </div>
  );
};

export default Login;
