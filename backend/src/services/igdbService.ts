import axios from 'axios';

const clientId = 'd7t46u698s137v2svsazz2swe8riys';
const clientSecret = 'qkgs9q5e8hbz4esqpywz9q7jmohe18';
let accessToken: any;

const getAccessToken = async (): Promise<string> => {
  if (accessToken) return accessToken;

  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    }
  });

  accessToken = response.data.access_token;
  return accessToken;
};

const fetchCoverUrl = async (coverId: number, token: string) => {
  const response = await axios.post('https://api.igdb.com/v4/covers', 
    `fields url; where id = ${coverId};`,
    {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (response.data && response.data.length > 0) {
    return response.data[0].url.replace('t_thumb', 't_cover_big');
  } else {
    return '';
  }
};

const fetchGameDetails = async (gameName: string) => {
  const token = await getAccessToken();
  
  let response = await axios.post('https://api.igdb.com/v4/games', 
    `search "${gameName}"; fields name, cover, summary, first_release_date; limit 5;`,
    {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    }
  );

  let gameData = response.data.find((game: any) => game.name.toLowerCase() === gameName.toLowerCase());
  
  if (!gameData && response.data.length > 0) {
    gameData = response.data[0];
  }

  if (!gameData) {
    throw new Error('Game not found');
  }

  const coverUrl = gameData.cover ? await fetchCoverUrl(gameData.cover, token) : '';

  return {
    name: gameData.name,
    summary: gameData.summary,
    coverUrl: coverUrl,
    releaseDate: gameData.first_release_date
  };
};

export default fetchGameDetails;
