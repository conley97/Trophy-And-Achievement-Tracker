import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../App.css';

export default function PsnGame({ match }) {
  const [gameDetails, setGameDetails] = useState(null);
  const [igdbDetails, setIgdbDetails] = useState(null);
  const [error, setError] = useState(null);
  const { username, gameName } = match.params;

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/psn/game/${username}/${gameName}`);
        setGameDetails(response.data);

        const igdbResponse = await axios.get(`http://localhost:3001/igdb/game/${response.data.gameName}`);
        setIgdbDetails(igdbResponse.data);
      } catch (err) {
        console.error("Error fetching game details:", err);
        setError('Error fetching game details');
      }
    };

    fetchGameDetails();
  }, [username, gameName]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!gameDetails || !igdbDetails) {
    return <div>Loading...</div>;
  }

  const backgroundUrl = gameDetails.backgroundUrl?.startsWith('http')
    ? gameDetails.backgroundUrl
    : `https:${gameDetails.backgroundUrl}`;

  const coverUrl = igdbDetails.coverUrl.startsWith('http') ? igdbDetails.coverUrl : `https:${igdbDetails.coverUrl}`;

  return (
    <div
      className='game-details-container'
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Make the background static
        minHeight: '100vh',
        overflow: 'auto',
        color: 'white',
        padding: '20px',
        paddingTop: '70px',
        boxSizing: 'border-box',
        margin: 0,
      }}
    >
      <div
        className='game-details'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          maxWidth: '900px',
          width: '90%',
          margin: '0 auto',
          padding: '20px',
          borderRadius: '10px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 30%', marginRight: '20px' }}>
            {igdbDetails.coverUrl && (
              <img
                src={coverUrl}
                alt={`${gameDetails.gameName} Cover`}
                style={{ width: '100%', borderRadius: '10px' }}
              />
            )}
          </div>
          <div style={{ flex: '1 1 70%', marginLeft: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>{gameDetails.gameName}</h1>
            <p style={{ marginBottom: '20px' }}>{igdbDetails.summary}</p>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: '20px' }}>
          <h2>Achievements</h2>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {gameDetails.trophies.map((trophy) => (
              <li key={trophy.trophyId} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                <img src={trophy.trophyIconUrl} alt={trophy.trophyName} style={{ width: '50px', marginRight: '10px' }} />
                <span>{trophy.trophyName} - {trophy.earned ? 'Earned' : 'Not Earned'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
