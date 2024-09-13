import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const SteamTextBoxComponent = () => {
  const [steamId, setSteamId] = useState('');
  const [achievements, setAchievements] = useState([]);
  const history = useHistory();

  const handleInputChange = (e) => {
    setSteamId(e.target.value);
  };

  const fetchAchievements = async () => {
    console.log("Fetching achievements for Steam ID:", steamId);
    try {
      const response = await axios.get(`http://localhost:3001/steam/games/${steamId}`);
      console.log("Response data:", response.data);
      setAchievements(response.data);
      history.push('/steamlogin', { achievements: response.data });
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={steamId}
        onChange={handleInputChange}
        placeholder="Enter Steam Code"
      />
      <button onClick={fetchAchievements}>Get Trophies</button>
      <div>
        {achievements.map((userAchievement) => (
          <div key={userAchievement._id}>
            <h2>App ID: {userAchievement.gameName}</h2>
            {userAchievement.achievements && userAchievement.achievements.length > 0 ? (
              userAchievement.achievements
                .filter((achievement) => achievement.achieved) // Filter to show only achieved achievements
                .map((achievement) => (
                  <div key={achievement.apiname}>
                    <h3>{achievement.apiname}</h3>
                    <p>Achieved: {achievement.achieved ? 'Yes' : 'No'}</p>
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

export default SteamTextBoxComponent;


