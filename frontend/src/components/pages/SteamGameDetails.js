import React from 'react';
import { useLocation } from 'react-router-dom';

const SteamGameDetails = () => {
  const location = useLocation();
  const { achievements } = location.state || { achievements: [] };

  if (!achievements || achievements.length === 0) {
    return <div>No trophy data available.</div>;
  }

  return (
    <div>
      <h1 className='steamgamedetailsh1'>Game Details:</h1>
      <h2 className='steamgamedetailsh2'>Your Trophies are listed Below:</h2>
      {achievements.length > 0 ? (
        achievements.filter((achievement) => achievement.achieved)
        .map((achievement) => (
          <div key={achievement._id}>
            <h4 className='steamgamedetailsh4'>{achievement.achievementName}</h4>
            <p1 className='steamgamedetailsp1'>Earned: {achievement.achieved ? 'Yes' : 'No'}</p1>
          </div>
        ))
      ) : (
        <p>No trophies found for this game.</p>
      )}
    </div>
  );
};

export default SteamGameDetails;