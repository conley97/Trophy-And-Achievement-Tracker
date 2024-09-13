import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory
import AuthContext from '../../context/AuthContext';
import './Register.css'; // Import the CSS file

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register, error } = useContext(AuthContext);
  const history = useHistory(); // Initialize useHistory

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await register(username, password);
      if (success) {
        history.push('/user'); // Redirect to /user after successful registration
      }
    } catch (err) {
      console.error('Registration failed:', err);
      // Error handling is already covered by the AuthContext error state
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h1>Register</h1>
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
        <button type="submit">Register</button>
        {error && <p className="error">{error}</p>} {/* Display error message */}
      </form>
    </div>
  );
};

export default Register;
