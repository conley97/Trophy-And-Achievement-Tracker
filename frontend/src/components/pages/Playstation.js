import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import AuthContext from '../../context/AuthContext'; 
import axios from 'axios';
import '../../App.css';
import './Playstation.css';

const Playstation = () => {
  const { user } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Initialize loading as false

  useEffect(() => {
    if (user?.psnId) {
      setLoading(true);
      axios.get(`http://localhost:3001/psn/trophies/${user.psnId}`)
        .then(response => {
          console.log("Response data: ", response.data);
          setGames(response.data);
        })
        .catch(error => {
          console.error("There was an error fetching the games!", error);
          setError('Failed to fetch games. Please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.psnId]);

  return (
    <div className='playstation-container'>
      <div className='background-color-playstation'></div>
      
      {/* PlayStation Logo */}
      <img 
        src="https://download.logo.wine/logo/PlayStation/PlayStation-Logo.wine.png" 
        alt="PlayStation Logo" 
        className="playstation-logo" 
      />
      
      <div className='playstation-content'>
        <h1 className='playstation-title'>PLAYSTATION</h1>
        <h2 className='playstation-welcome'>
          {user?.psnId
            ? `Welcome, ${user.psnId}! Here are your PlayStation games and their completion percentages.`
            : 'In order to see your PlayStation games, please set your PlayStation ID on the user page.'
          }
        </h2>
        {error && <p className="error">{error}</p>}
        <h2 className='playstation-subtitle'>
          PlayStation Games are Listed Below:
        </h2>
        <div className='playstation-games'>
          {loading ? (
            <p>Loading...</p>
          ) : games.length > 0 ? (
            games.map((game) => (
              <div key={game._id} className="psn-game-item">
                <img src={game.imageUrl} alt={game.gameName} className='psngame-image' />
                <div className='game-details'>
                  <h3 className='game-title'>
                    <Link to={{
                      pathname: `/psgame/${user.psnId}/${game.gameName}`,
                      state: { game }
                    }}>
                      {game.gameName}
                    </Link>  
                  </h3>
                  <p className='game-completion'>Completion: {game.completion}%</p>
                  <p className='game-platform'>Platform: {game.platform}</p>
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

export default Playstation;
