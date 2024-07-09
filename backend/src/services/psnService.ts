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
import TrophyModel from '../models/PsnTrophy';

export const fetchAndProcessPsnTrophies = async (username: string) => {
  try {
    const myNpsso = process.env.PSN_NPSSO as string;
    const accessCode = await exchangeNpssoForCode(myNpsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    const targetAccountId = await getExactMatchAccountId(authorization, username);
    const trophyTitles = await fetchAllTitles(authorization, targetAccountId);

    console.log(`Found ${trophyTitles.length} titles for user ${username}.`);

    // Use Promise.all to process all titles in parallel and maintain the order
    const processedTitles = await Promise.all(trophyTitles.map(async (title) => {
      console.log(`Fetching trophies for title: ${title.trophyTitleName}`);
      try {
        const titleTrophies = await fetchAllTrophies(authorization, title.npCommunicationId, title.trophyTitlePlatform);
        const earnedTrophies = await fetchAllEarnedTrophies(authorization, targetAccountId, title.npCommunicationId, title.trophyTitlePlatform);
        const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);
        return {
          gameName: title.trophyTitleName,
          platform: title.trophyTitlePlatform,
          trophies: mergedTrophies
        };
      } catch (error: any) {
        console.error(`Error processing trophies for ${title.trophyTitleName}:`, error.message);
        return null; 
      }
    }));
    
    const validTitles = processedTitles.filter(title => title !== null && title.trophies.length > 0);

    for (const gameData of validTitles) {
      await TrophyModel.findOneAndUpdate(
        { username, gameName: gameData!.gameName, platform: gameData!.platform },
        { $set: { trophies: gameData!.trophies } },
        { upsert: true, new: true }
      );
    }

    console.log("All valid trophy data has been successfully saved to MongoDB.");
  } catch (error) {
    console.error("An error occurred while processing PSN trophies:", error);
    throw error;
  }
};

export const getPsnTrophiesFromDB = async (username: string) => {
  const trophies = await TrophyModel.find({ username }).exec();
  if (!trophies) {
    throw new Error('No trophies found');
  }
  return trophies;
};

// Helper functions
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
        console.error('Unexpected response format or no trophies found:', response);
        break;
      }
      offset += limit;
    } catch (error) {
      console.error(`API call failed with error:`, error);
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
      console.error(`API call failed with error:`, error);
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

const normalizeTrophy = (trophy: Trophy) => ({
  trophyId: trophy.trophyId,
  trophyName: trophy.trophyName,
  trophyType: trophy.trophyType,
  trophyRare: rarityMap[trophy.trophyRare ?? 0],
  trophyEarnedRate: Number(trophy.trophyEarnedRate),
  earned: trophy.earned ?? false,
  earnedDateTime: trophy.earned ? trophy.earnedDateTime : undefined
});

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common"
};
