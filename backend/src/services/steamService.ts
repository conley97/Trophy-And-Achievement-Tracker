import axios from 'axios';
import SteamGameModel from '../models/SteamGame';

const key = '2809E5A58A0142C3F9AD9D81EC8648BB';
const apiKey = '468311f15e12397e80e18c85e3fff815';

export const fetchAndProcessSteamGames = async (steamId: string) => {
  try {
    console.log("Steam API Key: ", key);
    console.log("Fetching user owned games...");
    const ownedGames = await fetchOwnedGames(key, steamId);
    console.log("Owned games fetched successfully. Total games:", ownedGames.length);

    const processedGames = await Promise.all(ownedGames.map(async (game) => {
      console.log(`Processing game: ${game.name} (${game.appid})`);
      try {
        const achievements = await fetchAchievements(key, steamId, game.appid);
        if (!achievements || achievements.length === 0) {
          console.log(`No achievements found for ${game.name}, skipping.`);
          return null;
        }
        const completion = achievements ? (achievements.filter(a => a.achieved).length / achievements.length) * 100 : 0;
         // Fetch grid and hero URLs from SteamGridDB
         const gridUrls = await searchGameGrids(game.name, 3);
         const heroUrls = await searchGameHeroes(game.name, 3);
         const iconUrls = await searchGameIcons(game.name, 3);
 
         // Use only the first URL for each
         const coverUrl = gridUrls.length > 0 ? gridUrls[0] : '';
         const backgroundUrl = heroUrls.length > 0 ? heroUrls[0] : '';
         const iconUrl = iconUrls.length > 0 ? iconUrls[0] : '';

        return {
          gameName: game.name,
          appId: game.appid,
          achievements,
          imageUrl: iconUrl,
          completion: parseFloat(completion.toFixed(2)), // Save as number
          coverUrl,    // Store only the first URL
          backgroundUrl // Store only the first URL
        };
      } catch (error: any) {
        console.error(`Error processing achievements for ${game.name}:`, error.message);
        return null;
      }
    }));

    const validGames = processedGames.filter(game => game !== null);

    for (const gameData of validGames) {
      await SteamGameModel.updateOne(
        { steamId, appId: gameData!.appId },
        { $set: { gameName: gameData!.gameName, achievements: gameData!.achievements, imageUrl: gameData!.imageUrl, completion: gameData!.completion, backgroundUrl: gameData!.backgroundUrl, coverUrl: gameData!.coverUrl } },
        { upsert: true }
      );
    }

    console.log("All valid game data has been successfully saved to MongoDB.");
  } catch (error: any) {
    console.error("An error occurred during the script execution:", error.message);
    throw error;
  }
};

export const getSteamGamesFromDB = async (steamId: string) => {
  const games = await SteamGameModel.find({ steamId }).exec();
  if (!games) {
    throw new Error('No games found');
  }
  
  return games;
};

export const getSteamGameDetailsFromDB = async (steamId: string, gameName: string) => {
  const gameDetails = await SteamGameModel.findOne({ steamId, gameName }).exec();
  if (!gameDetails) {
    throw new Error('Game details not found');
  }
  console.log(steamId, gameName)
  return gameDetails;
};

const fetchOwnedGames = async (apiKey: string, steamId: string): Promise<any[]> => {
  try {
    const response = await axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
      params: {
        key: apiKey,
        steamid: steamId,
        include_appinfo: true
      }
    });

    console.log("Response data:", response.data);
    return response.data.response.games;
  } catch (error: any) {
    console.error("Error fetching owned games:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

const fetchAchievements = async (apiKey: string, steamId: string, appId: string): Promise<any[] | null> => {
  try {
    const response = await axios.get("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/", {
      params: {
        key: apiKey,
        steamid: steamId,
        appid: appId
      }
    });

    if (response.data.playerstats.success) {
      const schemaResponse = await axios.get("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/", {
        params: {
          key: apiKey,
          appid: appId
        }
      });

      const achievementSchema = schemaResponse.data.game.availableGameStats.achievements;
      const achievements = response.data.playerstats.achievements.map((achievement: any) => {
        const schema = achievementSchema.find((a: any) => a.name === achievement.apiname);
        return {
          achievementId: achievement.apiname,
          achievementName: schema ? schema.displayName : achievement.apiname,
          description: schema ? schema.description : '',
          achieved: achievement.achieved,
          unlockTime: achievement.unlocktime ? new Date(achievement.unlocktime * 1000) : null,
          iconUrl: schema ? schema.icon : null
        };
      });

      return achievements;
    } else {
      return null;
    }
  } catch (error: any) {
    if (error.response && (error.response.status === 400 || error.response.status === 403)) {
      console.error(`Failed to fetch achievements for appId ${appId}: ${error.response.statusText}`);
    } else {
      console.error(`Unexpected error fetching achievements for appId ${appId}:`, error.message);
    }
    return null;
  }
};


const searchGameGrids = async (gameName: string, limit: number): Promise<string[]> => {
  try {
    const response = await axios.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${gameName}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: 1,
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
    console.error('Error searching game grids:', error);
    return [];
  }
};

const searchGridByGameId = async (gameId: any, limit: any): Promise<string[]> => {
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

const searchGameHeroes = async (gameName: string, limit: number): Promise<string[]> => {
  try {
    const response = await axios.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${gameName}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: 1,
      },
    });

    const gameData = response.data.data;
    if (gameData && gameData.length > 0) {
      const firstGameId = gameData[0].id;
      console.log(`First game ID for heroes: ${firstGameId}`);
      const heroUrls = await searchHeroesByGameId(firstGameId, limit);
      return heroUrls;
    } else {
      console.log('No heroes found.');
      return [];
    }
  } catch (error) {
    console.error('Error searching game heroes:', error);
    return [];
  }
};

const searchIconsByGameId = async (gameId: any, limit: number): Promise<string[]> => {
  try {
    const response = await axios.get(`https://www.steamgriddb.com/api/v2/icons/game/${gameId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: limit,
      },
    });

    const iconData = response.data.data;
    const iconUrls = iconData.map((icon: any) => icon.url);
    console.log('icon URLs:', iconUrls);
    return iconUrls;
  } catch (error) {
    console.error('Error fetching icon data:', error);
    return [];
  }
};


const searchGameIcons= async (gameName: string, limit: number): Promise<string[]> => {
  try {
    const response = await axios.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${gameName}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: 1,
      },
    });

    const gameData = response.data.data;
    if (gameData && gameData.length > 0) {
      const firstGameId = gameData[0].id;
      console.log(`First game ID for icons: ${firstGameId}`);
      const iconUrls = await searchIconsByGameId(firstGameId, limit);
      return iconUrls;
    } else {
      console.log('No icons found.');
      return [];
    }
  } catch (error) {
    console.error('Error searching game Icons:', error);
    return [];
  }
};

const searchHeroesByGameId = async (gameId: any, limit: number): Promise<string[]> => {
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