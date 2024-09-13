import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SteamLogin = () => {
  const location = useLocation();
  const { achievements } = location.state || { achievements: [] };


  return (
    <div>
      <h1 className='steamloginh1'>Steam Login Page</h1>
      <h2 className='steamloginh2'>Steam games listed below:</h2>
      <div>
        {achievements.map((userAchievement) => (
          <div key={userAchievement._id} className="steam-game-item">
            
            <h3 className='steamloginh3'>
            <img src={userAchievement.imageUrl} alt={userAchievement.gameName} className='steamgameImage'/>
            <Link to={{
                  pathname: `/steamgame/${userAchievement._id}`,
                  state: { achievements: userAchievement.achievements } // Pass trophies data
                }}
              >
                {userAchievement.gameName}
              </Link>
            </h3>
            {userAchievement.achievements && userAchievement.achievements.length > 0 ? (
              userAchievement.achievements
                .filter((achievement) => achievement.achieved) // Filter to show only achieved achievements
                .map((achievement) => (
                  <div key={achievement.apiname}>
                  </div>
                ))
            ) : (
              <p>No achievements found for this app.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SteamLogin;

