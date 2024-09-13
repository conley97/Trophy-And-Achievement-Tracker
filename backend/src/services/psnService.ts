// src/services/psnService.ts
import { Trophy, TitleTrophiesResponse, UserTrophiesEarnedForTitleResponse } from "psn-api";
import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  getTitleTrophies,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  makeUniversalSearch,
  TrophyRarity
} from "psn-api";
import axios from 'axios';
import TrophyModel from '../models/PsnTrophy';

let cachedAuthorization: any;

const apiKey = '468311f15e12397e80e18c85e3fff815';

const getAuthorization = async (): Promise<any> => {
  if (!cachedAuthorization) {
    const myNpsso = 'z7wJLjo09uQCQTjoePDaUZlemnV2Ro0gYFck7h2GViq1lRWP4q08xSpansGk0cvM';
    const accessCode = await exchangeNpssoForCode(myNpsso);
    cachedAuthorization = await exchangeCodeForAccessToken(accessCode);
  }
  return cachedAuthorization;
};

const cleanGameName = (gameName: string) => {
  return gameName.replace(/ Trophies$/, '').replace(/®|™/g, '');
};

export const fetchAndProcessPsnTrophies = async (username: string) => {
  try {
    const authorization = await getAuthorization();
    const targetAccountId = await getExactMatchAccountId(authorization, username);
    const trophyTitles = await fetchAllTitles(authorization, targetAccountId);

    console.log(`Found ${trophyTitles.length} titles for user ${username}.`);

    const processedTitles = await Promise.all(trophyTitles.map(async (title) => {
      console.log(`Fetching trophies for title: ${title.trophyTitleName}`);
      try {
        const titleTrophies = await fetchAllTrophies(authorization, title.npCommunicationId, title.trophyTitlePlatform);
        const earnedTrophies = await fetchAllEarnedTrophies(authorization, targetAccountId, title.npCommunicationId, title.trophyTitlePlatform);
        const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);

        // Clean the game name
        const cleanedGameName = cleanGameName(title.trophyTitleName);

        // Calculate completion percentage
        const totalTrophies = titleTrophies.length;
        const earnedCount = mergedTrophies.filter(trophy => trophy.earned).length;
        const completion = (earnedCount / totalTrophies) * 100;

        // Fetch grid and hero URLs from SteamGridDB
        const gridUrls = await searchGameGrids(cleanedGameName, 3);
        const heroUrls = await searchGameHeroes(cleanedGameName, 3);
        const iconUrls = await searchGameIcons(cleanedGameName, 3);

        // Use only the first URL for each
        const coverUrl = gridUrls.length > 0 ? gridUrls[0] : '';
        const backgroundUrl = heroUrls.length > 0 ? heroUrls[0] : '';
        const iconUrl = iconUrls.length > 0 ? iconUrls[0] : '';

        return {
          gameName: cleanedGameName,
          platform: title.trophyTitlePlatform,
          trophies: mergedTrophies.map(trophy => ({
            ...trophy,
            trophyIconUrl: trophy.trophyIconUrl // Add trophy icon URL
          })),
          imageUrl: iconUrl,
          completion: parseFloat(completion.toFixed(2)), // Save as number
          coverUrl,    // Store only the first URL
          backgroundUrl // Store only the first URL
        };
      } catch (error: any) {
        console.error(`Error processing trophies for ${title.trophyTitleName}:`, error.message);
        return null; 
      }
    }));
    
    const validTitles = processedTitles.filter(title => title !== null && title.trophies.length > 0);

    for (const gameData of validTitles) {
      await TrophyModel.updateOne(
        { username, gameName: gameData!.gameName, platform: gameData!.platform },
        { $set: { trophies: gameData!.trophies, imageUrl: gameData!.imageUrl, completion: gameData!.completion, coverUrl: gameData!.coverUrl, backgroundUrl: gameData!.backgroundUrl } },
        { upsert: true }
      );
    }

    console.log("All valid trophy data has been successfully saved to MongoDB.");
  } catch (error) {
    console.error("An error occurred while processing PSN trophies:", error);
    throw error;
  }
};

export const getPsnGameDetailsFromDB = async (username: string, gameName: string) => {
  const cleanedGameName = cleanGameName(gameName);
  const gameDetails = await TrophyModel.findOne({ username, gameName: cleanedGameName }).exec();
  if (!gameDetails) {
    throw new Error('Game details not found');
  }
  return gameDetails;
};

export const getPsnTrophiesFromDB = async (username: string) => {
  const trophies = await TrophyModel.find({ username }).exec();
  if (!trophies) {
    throw new Error('No trophies found');
  }
  return trophies;
};

// Helper functions

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



const getExactMatchAccountId = async (authorization: any, username: string): Promise<string> => {
  const searchResults = await makeUniversalSearch(authorization, username, "SocialAllAccounts");
  if (!searchResults || !searchResults.domainResponses[0].results) {
    throw new Error('No search results found');
  }
  const exactMatch = searchResults.domainResponses[0].results.find(result => result.socialMetadata.onlineId === username);
  if (!exactMatch) throw new Error(`No exact match found for username: ${username}`);
  return exactMatch.socialMetadata.accountId;
};

const fetchAllTitles = async (authorization: any, accountId: string): Promise<any[]> => {
  let titles = [], offset = 0, limit = 100;
  while (true) {
    const response = await getUserTitles(authorization, accountId, { limit, offset });
    if (!response || !response.trophyTitles) {
      console.error('Unexpected response format or no titles found:', response);
      break;
    }
    titles.push(...response.trophyTitles);
    if (response.trophyTitles.length < limit) break;
    offset += limit;
  }
  return titles;
};

const fetchAllTrophies = async (authorization: any, npCommunicationId: string, platform: string): Promise<Trophy[]> => {
  let trophies: Trophy[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    try {
      const response: TitleTrophiesResponse = await getTitleTrophies(authorization, npCommunicationId, "all", { limit, offset, npServiceName: platform !== "PS5" ? "trophy" : undefined });
      if (response && response.trophies) {
        trophies = trophies.concat(response.trophies);
        if (response.trophies.length < limit) break;
      } else {
        console.error('Unexpected response format or no trophies found:', npCommunicationId);
        break;
      }
      offset += limit;
    } catch (error) {
      console.error(`API call failed with error`);
      break;  
    }
  }
  return trophies;
};

const fetchAllEarnedTrophies = async (authorization: any, accountId: string, npCommunicationId: string, platform: string): Promise<Trophy[]> => {
  let trophies = [], offset = 0, limit = 100;
  while (true) {
    try {
      const response: UserTrophiesEarnedForTitleResponse = await getUserTrophiesEarnedForTitle(authorization, accountId, npCommunicationId, "all", { limit, offset, npServiceName: platform !== "PS5" ? "trophy" : undefined });
      if (response && response.trophies) {
        trophies.push(...response.trophies);
        if (response.trophies.length < limit) break;
      } else {
        console.error('Unexpected response format or no earned trophies found:', response);
        break;
      }
      offset += limit;
    } catch (error) {
      console.error('API call failed with error');
      break;  // Exit the loop if an API call fails
    }
  }
  return trophies;
};

const mergeTrophyLists = (titleTrophies: Trophy[], earnedTrophies: Trophy[]): any[] => {
  return earnedTrophies.map(earned => ({
    ...titleTrophies.find(t => t.trophyId === earned.trophyId),
    ...earned,
  })).filter(trophy => trophy.trophyId);
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common"
};
