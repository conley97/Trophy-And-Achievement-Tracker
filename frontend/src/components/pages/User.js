import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';  // Correct import without destructuring
import './User.css'; // Import the CSS file

const User = () => {
  const { user, setUser, logout } = useContext(AuthContext); // Include logout function from context
  const [psnId, setPsnId] = useState(user?.psnId || '');
  const [steamId, setSteamId] = useState(user?.steamId || '');
  const [message, setMessage] = useState(''); // Message to display update status
  const [loading, setLoading] = useState(false); // Loading state to indicate processing

  // Function to handle both update and refresh
  const updateIds = async (forceUpdate = false) => {
    try {
      let newToken = null;
      let updatedFields = []; // Keep track of which fields were updated

      if (forceUpdate || psnId !== user.psnId) {
        // Update PSN ID on your server
        const response = await axios.put('http://localhost:3001/user/update-psn-id', {
          username: user.username,
          psnId,
        });
        console.log('PSN ID updated successfully:', response.data);
        newToken = response.data.token; // Get new token
        updatedFields.push('PSN ID'); // Record update

        // Trigger PSN ID update
        await axios.post(`http://localhost:3001/psn/update/${psnId}`);
        console.log(`PSN data update triggered for: ${psnId}`);
      }

      if (forceUpdate || steamId !== user.steamId) {
        // Update Steam ID on your server
        const response = await axios.put('http://localhost:3001/user/update-steam-id', {
          username: user.username,
          steamId,
        });
        console.log('Steam ID updated successfully:', response.data);
        newToken = response.data.token; // Get new token
        updatedFields.push('Steam ID'); // Record update

        // Trigger Steam ID update
        await axios.post(`http://localhost:3001/steam/update/${steamId}`);
        console.log(`Steam data update triggered for: ${steamId}`);
      }

      if (newToken) {
        const decoded = jwtDecode(newToken); // Decode new token to get user data
        setUser(decoded); // Update user context with new data
        localStorage.setItem('token', newToken); // Store new token
      }

      // Set message based on updates
      if (updatedFields.length > 0) {
        if (updatedFields.length === 2) {
          setMessage('Both PSN ID and Steam ID updated successfully.');
        } else {
          setMessage(`${updatedFields[0]} updated successfully.`);
        }
      } else {
        setMessage('No changes were made.');
      }
    } catch (error) {
      console.error('Error updating IDs:', error);
      setMessage('Error updating platform IDs');
    } finally {
      setLoading(false); // Set loading to false after processing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submitting
    await updateIds(); // Update IDs based on changes
  };

  const handleRefresh = async () => {
    setLoading(true); // Set loading to true when refreshing
    await updateIds(true); // Force update IDs regardless of changes
  };

  const handleLogout = () => {
    logout(); // Call the logout function from the AuthContext
  };

  useEffect(() => {
    setPsnId(user?.psnId || '');
    setSteamId(user?.steamId || '');
  }, [user]);

  return (
    <div className="user-container">
      {user ? (
        <div className="user-form">
          <h1>Manage Platform IDs</h1>
          {loading && <p className="loading">Updating...</p>} {/* Display loading message */}
          {message && <p className="message">{message}</p>} {/* Display message to user */}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="psnId">PSN ID:</label>
              <input
                type="text"
                id="psnId"
                value={psnId}
                onChange={(e) => setPsnId(e.target.value)}
                placeholder="Enter PSN ID"
                disabled={loading} // Disable input when loading
              />
            </div>
            <div>
              <label htmlFor="steamId">Steam ID:</label>
              <input
                type="text"
                id="steamId"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="Enter Steam ID"
                disabled={loading} // Disable input when loading
              />
            </div>
            <div className="button-group"> {/* Button group for flexbox layout */}
              <button type="submit" disabled={loading}>Update IDs</button>
              <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
                Refresh User Data
              </button>
            </div>
          </form>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <div className="user-form">
          <h1>Welcome</h1>
          <p>Please register or log in to manage your platform IDs.</p>
          <Link to="/register" className="link-button">Register</Link>
          <Link to="/login" className="link-button">Log In</Link>
        </div>
      )}
    </div>
  );
};

export default User;
