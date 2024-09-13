import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const PSNTextBoxComponent = () => {
  const [playstationID, setPlaystationID] = useState('');
  const [trophies, setTrophies] = useState([]);
  const history = useHistory();

  const handleInputChange = (e) => {
    setPlaystationID(e.target.value);
  };

  const fetchTrophies = async () => {
    if (!playstationID) {
      console.log("Playstation ID is empty.");
      return;
    }
    
    console.log("Fetching trophies for username:", playstationID);
    try {
      const response = await axios.get(`http://localhost:3001/psn/trophies/${playstationID}`);
      console.log("Response data:", response.data);
      // Check if response data is an array and update state accordingly
      if (Array.isArray(response.data)) {
        setTrophies(response.data);
        history.push('/playstationlogin', { trophies: response.data });
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching trophies:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={playstationID}
        onChange={handleInputChange}
        placeholder="Enter Playstation ID"
      />
      <button onClick={fetchTrophies}>Get Trophies</button>
      <div>
        <ul>
        {trophies.length > 0 ? (
          trophies.map((userTrophy) => (
            <li key={userTrophy._id}>
              <h2>{userTrophy.gameName} (Platform: {userTrophy.platform})</h2>
              {userTrophy.trophies && userTrophy.trophies.length > 0 ? (
                userTrophy.trophies
                  .filter((trophy) => trophy.earned) // Filter to show only earned trophies
                  .map((trophy) => (
                    <div key={trophy._id}>
                      <h3>{trophy.trophyName}</h3>
                      <p>Type: {trophy.trophyType}</p>
                      <p>Rarity: {trophy.trophyRare}</p>
                      <p>Earned: {trophy.earned ? 'Yes' : 'No'}</p>
                    </div>
                  ))
              ) : (
                <p>No trophies found for this game.</p>
              )}
            </li>
          )) 
        ) : ( 
          <p></p>
        )} </ul>
      </div>
    </div>
  );
};

export default PSNTextBoxComponent;

