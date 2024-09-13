import axios from 'axios';

const apiKey = '468311f15e12397e80e18c85e3fff815'; // Replace with your actual SteamGridDB API key

// Function to search for a game by name and return the image URL
const searchGameByName = async (term: string, limit: number): Promise<string[]> => {
  try {
    const response = await axios.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${term}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: limit,
      },
    });

    const gameData = response.data.data;
    if (gameData && gameData.length > 0) {
      const firstGameId = gameData[0].id;
      console.log(`First game ID: ${firstGameId}`);
      const gridUrls = await searchGridByGameId(firstGameId, limit);
      return gridUrls;
    } else {
      console.log('No games found.');
      return [];
    }
  } catch (error) {
    console.error('Error searching game:', error);
    return [];
  }
};

// Function to search for a game's grid by its ID and return the image URLs
const searchGridByGameId = async (gameId: number, limit: number): Promise<string[]> => {
  try {
    const response = await axios.get(`https://www.steamgriddb.com/api/v2/grids/game/${gameId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: limit,
      },
    });

    const gridData = response.data.data;
    const gridUrls = gridData.map((grid: any) => grid.url);
    console.log('Grid URLs:', gridUrls);
    return gridUrls;
  } catch (error) {
    console.error('Error fetching grid data:', error);
    return [];
  }
};

// Function to search for heroes by game ID and return the image URLs
const searchHeroesByGameId = async (gameId: number, limit: number): Promise<string[]> => {
  try {
    const response = await axios.get(`https://www.steamgriddb.com/api/v2/heroes/game/${gameId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: limit,
      },
    });

    const heroData = response.data.data;
    const heroUrls = heroData.map((hero: any) => hero.url);
    console.log('Hero URLs:', heroUrls);
    return heroUrls;
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return [];
  }
};

// Helper function to get the first game ID
const getFirstGameId = async (term: string, limit: number): Promise<number> => {
    try {
      const response = await axios.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${term}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        params: {
          limit: limit,
        },
      });
  
      const gameData = response.data.data;
      if (gameData && gameData.length > 0) {
        return gameData[0].id;
      } else {
        console.log('No games found.');
        return -1;
      }
    } catch (error) {
      console.error('Error fetching game ID:', error);
      return -1;
    }
  };

// Example usage
(async () => {
  const gameName = 'God of War';
  const limit = 1;
  
  // Fetch game grids
  const gridUrls = await searchGameByName(gameName, limit);
  console.log('Grid Image URLs:', gridUrls);

  // If a game was found, fetch heroes
  if (gridUrls.length > 0) {
    const firstGameId = await getFirstGameId(gameName, limit);
    const heroUrls = await searchHeroesByGameId(firstGameId, limit);
    console.log('Hero Image URLs:', heroUrls);
  }
})();


