// Playstation.js
import { useLocation, Link } from 'react-router-dom';
import React from 'react';


const PlaystationLogin = () => {
  const location = useLocation();
  const { trophies } = location.state || { trophies: [] };

  return (
    <div>
      <h1 className='playstationloginh1'>Playstation Login Page</h1>
      <h2 className='playstationloginh2'>Playstation Games are Listed Below:</h2>
      <div>
        {trophies.map((userTrophy) => (
          <div key={userTrophy._id} className="psn-game-item">

            <h3 className='playstationloginh3'>
            <img src={userTrophy.imageUrl} alt={userTrophy.gameName} className='psngameImage'/>
            <Link to={{
                  pathname: `/game/${userTrophy._id}`,
                  state: { trophies: userTrophy.trophies } // Pass trophies data
                }}
              >
                {userTrophy.gameName} (Platform: {userTrophy.platform})
              </Link>  
            </h3>
            {userTrophy.trophies && userTrophy.trophies.length > 0 ? (
              userTrophy.trophies
                .filter((trophy) => trophy.earned) // Filter to show only earned trophies
                .map((trophy) => (
                  <div key={trophy._id}> 
                   <h4>
                    </h4>

                  </div>
                ))
            ) : (
              <p>No trophies found for this game.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaystationLogin;
