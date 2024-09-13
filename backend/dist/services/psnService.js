"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPsnTrophiesFromDB = exports.getPsnGameDetailsFromDB = exports.fetchAndProcessPsnTrophies = void 0;
const psn_api_1 = require("psn-api");
const axios_1 = __importDefault(require("axios"));
const PsnTrophy_1 = __importDefault(require("../models/PsnTrophy"));
let cachedAuthorization;
const apiKey = '468311f15e12397e80e18c85e3fff815';
const getAuthorization = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!cachedAuthorization) {
        const myNpsso = 'z7wJLjo09uQCQTjoePDaUZlemnV2Ro0gYFck7h2GViq1lRWP4q08xSpansGk0cvM';
        const accessCode = yield (0, psn_api_1.exchangeNpssoForCode)(myNpsso);
        cachedAuthorization = yield (0, psn_api_1.exchangeCodeForAccessToken)(accessCode);
    }
    return cachedAuthorization;
});
const cleanGameName = (gameName) => {
    return gameName.replace(/ Trophies$/, '').replace(/®|™/g, '');
};
const fetchAndProcessPsnTrophies = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authorization = yield getAuthorization();
        const targetAccountId = yield getExactMatchAccountId(authorization, username);
        const trophyTitles = yield fetchAllTitles(authorization, targetAccountId);
        console.log(`Found ${trophyTitles.length} titles for user ${username}.`);
        const processedTitles = yield Promise.all(trophyTitles.map((title) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Fetching trophies for title: ${title.trophyTitleName}`);
            try {
                const titleTrophies = yield fetchAllTrophies(authorization, title.npCommunicationId, title.trophyTitlePlatform);
                const earnedTrophies = yield fetchAllEarnedTrophies(authorization, targetAccountId, title.npCommunicationId, title.trophyTitlePlatform);
                const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);
                // Clean the game name
                const cleanedGameName = cleanGameName(title.trophyTitleName);
                // Calculate completion percentage
                const totalTrophies = titleTrophies.length;
                const earnedCount = mergedTrophies.filter(trophy => trophy.earned).length;
                const completion = (earnedCount / totalTrophies) * 100;
                // Fetch grid and hero URLs from SteamGridDB
                const gridUrls = yield searchGameGrids(cleanedGameName, 3);
                const heroUrls = yield searchGameHeroes(cleanedGameName, 3);
                const iconUrls = yield searchGameIcons(cleanedGameName, 3);
                // Use only the first URL for each
                const coverUrl = gridUrls.length > 0 ? gridUrls[0] : '';
                const backgroundUrl = heroUrls.length > 0 ? heroUrls[0] : '';
                const iconUrl = iconUrls.length > 0 ? iconUrls[0] : '';
                return {
                    gameName: cleanedGameName,
                    platform: title.trophyTitlePlatform,
                    trophies: mergedTrophies.map(trophy => (Object.assign(Object.assign({}, trophy), { trophyIconUrl: trophy.trophyIconUrl // Add trophy icon URL
                     }))),
                    imageUrl: iconUrl,
                    completion: parseFloat(completion.toFixed(2)), // Save as number
                    coverUrl, // Store only the first URL
                    backgroundUrl // Store only the first URL
                };
            }
            catch (error) {
                console.error(`Error processing trophies for ${title.trophyTitleName}:`, error.message);
                return null;
            }
        })));
        const validTitles = processedTitles.filter(title => title !== null && title.trophies.length > 0);
        for (const gameData of validTitles) {
            yield PsnTrophy_1.default.updateOne({ username, gameName: gameData.gameName, platform: gameData.platform }, { $set: { trophies: gameData.trophies, imageUrl: gameData.imageUrl, completion: gameData.completion, coverUrl: gameData.coverUrl, backgroundUrl: gameData.backgroundUrl } }, { upsert: true });
        }
        console.log("All valid trophy data has been successfully saved to MongoDB.");
    }
    catch (error) {
        console.error("An error occurred while processing PSN trophies:", error);
        throw error;
    }
});
exports.fetchAndProcessPsnTrophies = fetchAndProcessPsnTrophies;
const getPsnGameDetailsFromDB = (username, gameName) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanedGameName = cleanGameName(gameName);
    const gameDetails = yield PsnTrophy_1.default.findOne({ username, gameName: cleanedGameName }).exec();
    if (!gameDetails) {
        throw new Error('Game details not found');
    }
    return gameDetails;
});
exports.getPsnGameDetailsFromDB = getPsnGameDetailsFromDB;
const getPsnTrophiesFromDB = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const trophies = yield PsnTrophy_1.default.find({ username }).exec();
    if (!trophies) {
        throw new Error('No trophies found');
    }
    return trophies;
});
exports.getPsnTrophiesFromDB = getPsnTrophiesFromDB;
// Helper functions
const searchGameGrids = (gameName, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${gameName}`, {
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
            const gridUrls = yield searchGridByGameId(firstGameId, limit);
            return gridUrls;
        }
        else {
            console.log('No games found.');
            return [];
        }
    }
    catch (error) {
        console.error('Error searching game grids:', error);
        return [];
    }
});
const searchGridByGameId = (gameId, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/grids/game/${gameId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            params: {
                limit: limit,
            },
        });
        const gridData = response.data.data;
        const gridUrls = gridData.map((grid) => grid.url);
        console.log('Grid URLs:', gridUrls);
        return gridUrls;
    }
    catch (error) {
        console.error('Error fetching grid data:', error);
        return [];
    }
});
const searchGameHeroes = (gameName, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${gameName}`, {
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
            const heroUrls = yield searchHeroesByGameId(firstGameId, limit);
            return heroUrls;
        }
        else {
            console.log('No heroes found.');
            return [];
        }
    }
    catch (error) {
        console.error('Error searching game heroes:', error);
        return [];
    }
});
const searchIconsByGameId = (gameId, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/icons/game/${gameId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            params: {
                limit: limit,
            },
        });
        const iconData = response.data.data;
        const iconUrls = iconData.map((icon) => icon.url);
        console.log('icon URLs:', iconUrls);
        return iconUrls;
    }
    catch (error) {
        console.error('Error fetching icon data:', error);
        return [];
    }
});
const searchGameIcons = (gameName, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${gameName}`, {
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
            const iconUrls = yield searchIconsByGameId(firstGameId, limit);
            return iconUrls;
        }
        else {
            console.log('No icons found.');
            return [];
        }
    }
    catch (error) {
        console.error('Error searching game Icons:', error);
        return [];
    }
});
const searchHeroesByGameId = (gameId, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/heroes/game/${gameId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            params: {
                limit: limit,
            },
        });
        const heroData = response.data.data;
        const heroUrls = heroData.map((hero) => hero.url);
        console.log('Hero URLs:', heroUrls);
        return heroUrls;
    }
    catch (error) {
        console.error('Error fetching hero data:', error);
        return [];
    }
});
const getExactMatchAccountId = (authorization, username) => __awaiter(void 0, void 0, void 0, function* () {
    const searchResults = yield (0, psn_api_1.makeUniversalSearch)(authorization, username, "SocialAllAccounts");
    if (!searchResults || !searchResults.domainResponses[0].results) {
        throw new Error('No search results found');
    }
    const exactMatch = searchResults.domainResponses[0].results.find(result => result.socialMetadata.onlineId === username);
    if (!exactMatch)
        throw new Error(`No exact match found for username: ${username}`);
    return exactMatch.socialMetadata.accountId;
});
const fetchAllTitles = (authorization, accountId) => __awaiter(void 0, void 0, void 0, function* () {
    let titles = [], offset = 0, limit = 100;
    while (true) {
        const response = yield (0, psn_api_1.getUserTitles)(authorization, accountId, { limit, offset });
        if (!response || !response.trophyTitles) {
            console.error('Unexpected response format or no titles found:', response);
            break;
        }
        titles.push(...response.trophyTitles);
        if (response.trophyTitles.length < limit)
            break;
        offset += limit;
    }
    return titles;
});
const fetchAllTrophies = (authorization, npCommunicationId, platform) => __awaiter(void 0, void 0, void 0, function* () {
    let trophies = [];
    let offset = 0;
    const limit = 100;
    while (true) {
        try {
            const response = yield (0, psn_api_1.getTitleTrophies)(authorization, npCommunicationId, "all", { limit, offset, npServiceName: platform !== "PS5" ? "trophy" : undefined });
            if (response && response.trophies) {
                trophies = trophies.concat(response.trophies);
                if (response.trophies.length < limit)
                    break;
            }
            else {
                console.error('Unexpected response format or no trophies found:', npCommunicationId);
                break;
            }
            offset += limit;
        }
        catch (error) {
            console.error(`API call failed with error`);
            break;
        }
    }
    return trophies;
});
const fetchAllEarnedTrophies = (authorization, accountId, npCommunicationId, platform) => __awaiter(void 0, void 0, void 0, function* () {
    let trophies = [], offset = 0, limit = 100;
    while (true) {
        try {
            const response = yield (0, psn_api_1.getUserTrophiesEarnedForTitle)(authorization, accountId, npCommunicationId, "all", { limit, offset, npServiceName: platform !== "PS5" ? "trophy" : undefined });
            if (response && response.trophies) {
                trophies.push(...response.trophies);
                if (response.trophies.length < limit)
                    break;
            }
            else {
                console.error('Unexpected response format or no earned trophies found:', response);
                break;
            }
            offset += limit;
        }
        catch (error) {
            console.error('API call failed with error');
            break; // Exit the loop if an API call fails
        }
    }
    return trophies;
});
const mergeTrophyLists = (titleTrophies, earnedTrophies) => {
    return earnedTrophies.map(earned => (Object.assign(Object.assign({}, titleTrophies.find(t => t.trophyId === earned.trophyId)), earned))).filter(trophy => trophy.trophyId);
};
const rarityMap = {
    [psn_api_1.TrophyRarity.VeryRare]: "Very Rare",
    [psn_api_1.TrophyRarity.UltraRare]: "Ultra Rare",
    [psn_api_1.TrophyRarity.Rare]: "Rare",
    [psn_api_1.TrophyRarity.Common]: "Common"
};
