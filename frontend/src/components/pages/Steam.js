import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import AuthContext from '../../context/AuthContext'; 
import axios from 'axios';
import '../../App.css';
import './Steam.css'; // Ensure this CSS file is imported

const Steam = () => {
  const { user } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.steamId) {
      setLoading(true);
      axios.get(`http://localhost:3001/steam/games/${user.steamId}`)
        .then(response => {
          console.log("Steam API Response data: ", response.data); // Log the response data
          setGames(response.data);
          setError(''); // Clear any previous errors
        })
        .catch(error => {
          console.error("There was an error fetching the games!", error);
          setError('Failed to fetch games. Please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      console.warn("No Steam ID found for user:", user); // Log warning if steamId is missing
    }
  }, [user?.steamId]);

  return (
    <div className='steam-container'>
      <div className='background-color-steam'></div>
      
      {/* Steam Logo */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" 
        alt="Steam Logo" 
        className="steam-logo" 
      />

      <div className='steam-content'>
        <h1 className='steamh1'>STEAM</h1>
        <h2 className='steamh2'>
          {user?.steamId
            ? `Welcome, ${user.steamId}! Here are your Steam games and their completion percentages.`
            : 'In order to see your Steam games, please set your Steam ID on the user page.'
          }
        </h2>
        {error && <p className="error">{error}</p>}
        <h2 className='steamh2' style={{ marginTop: '20px' }}>
          Steam Games are Listed Below:
        </h2>
        <div className='steam-games'>
          {loading ? (
            <p>Loading...</p>
          ) : games.length > 0 ? (
            games.map((game) => (
              <div key={game._id} className="steam-game-item">
                <img src={game.imageUrl} alt={game.gameName} className='steamgameImage' />
                <div className='game-details'>
                  <h3 className='steamloginh3'>
                    <Link to={{
                      pathname: `/steamgame/${user.steamId}/${game.gameName}`,
                      state: { game }
                    }}>
                      {game.gameName}
                    </Link>  
                  </h3>
                  <p className='game-completion'>Completion: {game.completion}%</p>
                </div>
              </div>
            ))
          ) : (
            <p>No games found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Steam;
