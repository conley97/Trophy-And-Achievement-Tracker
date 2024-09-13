import React from 'react';
import { useLocation } from 'react-router-dom';

const PSNGameDetails = () => {
  const location = useLocation();
  const { trophies } = location.state || { trophies: [] };

  if (!trophies || trophies.length === 0) {
    return <div>No trophy data available.</div>;
  }

  return (
    <div>
      <h1 className='psngamedetailsh1'>Game Details:</h1>
      <h2 className='psngamedetailsh2'>Your Trophies are listed Below:</h2>
      {trophies.length > 0 ? (
        trophies.filter((trophy) => trophy.earned)
        .map((trophy) => (
          <div key={trophy._id}>
            <h4 className='psngamedetailsh4'>{trophy.trophyName}</h4>
            <p1 className='psngamedetailsp1'>Type: {trophy.trophyType}</p1>
            <p2 className='psngamedetailsp2'>Rarity: {trophy.trophyRare}</p2>
            <p3 className='psngamedetailsp3'>Earned: {trophy.earned ? 'Yes' : 'No'}</p3>
          </div>
        ))
      ) : (
        <p>No trophies found for this game.</p>
      )}
    </div>
  );
};

export default PSNGameDetails;
