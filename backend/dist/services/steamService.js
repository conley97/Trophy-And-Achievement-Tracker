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
exports.getSteamGameDetailsFromDB = exports.getSteamGamesFromDB = exports.fetchAndProcessSteamGames = void 0;
const axios_1 = __importDefault(require("axios"));
const SteamGame_1 = __importDefault(require("../models/SteamGame"));
const key = '2809E5A58A0142C3F9AD9D81EC8648BB';
const apiKey = '468311f15e12397e80e18c85e3fff815';
const fetchAndProcessSteamGames = (steamId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Steam API Key: ", key);
        console.log("Fetching user owned games...");
        const ownedGames = yield fetchOwnedGames(key, steamId);
        console.log("Owned games fetched successfully. Total games:", ownedGames.length);
        const processedGames = yield Promise.all(ownedGames.map((game) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Processing game: ${game.name} (${game.appid})`);
            try {
                const achievements = yield fetchAchievements(key, steamId, game.appid);
                if (!achievements || achievements.length === 0) {
                    console.log(`No achievements found for ${game.name}, skipping.`);
                    return null;
                }
                const completion = achievements ? (achievements.filter(a => a.achieved).length / achievements.length) * 100 : 0;
                // Fetch grid and hero URLs from SteamGridDB
                const gridUrls = yield searchGameGrids(game.name, 3);
                const heroUrls = yield searchGameHeroes(game.name, 3);
                const iconUrls = yield searchGameIcons(game.name, 3);
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
                    coverUrl, // Store only the first URL
                    backgroundUrl // Store only the first URL
                };
            }
            catch (error) {
                console.error(`Error processing achievements for ${game.name}:`, error.message);
                return null;
            }
        })));
        const validGames = processedGames.filter(game => game !== null);
        for (const gameData of validGames) {
            yield SteamGame_1.default.updateOne({ steamId, appId: gameData.appId }, { $set: { gameName: gameData.gameName, achievements: gameData.achievements, imageUrl: gameData.imageUrl, completion: gameData.completion, backgroundUrl: gameData.backgroundUrl, coverUrl: gameData.coverUrl } }, { upsert: true });
        }
        console.log("All valid game data has been successfully saved to MongoDB.");
    }
    catch (error) {
        console.error("An error occurred during the script execution:", error.message);
        throw error;
    }
});
exports.fetchAndProcessSteamGames = fetchAndProcessSteamGames;
const getSteamGamesFromDB = (steamId) => __awaiter(void 0, void 0, void 0, function* () {
    const games = yield SteamGame_1.default.find({ steamId }).exec();
    if (!games) {
        throw new Error('No games found');
    }
    return games;
});
exports.getSteamGamesFromDB = getSteamGamesFromDB;
const getSteamGameDetailsFromDB = (steamId, gameName) => __awaiter(void 0, void 0, void 0, function* () {
    const gameDetails = yield SteamGame_1.default.findOne({ steamId, gameName }).exec();
    if (!gameDetails) {
        throw new Error('Game details not found');
    }
    console.log(steamId, gameName);
    return gameDetails;
});
exports.getSteamGameDetailsFromDB = getSteamGameDetailsFromDB;
const fetchOwnedGames = (apiKey, steamId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
            params: {
                key: apiKey,
                steamid: steamId,
                include_appinfo: true
            }
        });
        console.log("Response data:", response.data);
        return response.data.response.games;
    }
    catch (error) {
        console.error("Error fetching owned games:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
});
const fetchAchievements = (apiKey, steamId, appId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/", {
            params: {
                key: apiKey,
                steamid: steamId,
                appid: appId
            }
        });
        if (response.data.playerstats.success) {
            const schemaResponse = yield axios_1.default.get("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/", {
                params: {
                    key: apiKey,
                    appid: appId
                }
            });
            const achievementSchema = schemaResponse.data.game.availableGameStats.achievements;
            const achievements = response.data.playerstats.achievements.map((achievement) => {
                const schema = achievementSchema.find((a) => a.name === achievement.apiname);
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
        }
        else {
            return null;
        }
    }
    catch (error) {
        if (error.response && (error.response.status === 400 || error.response.status === 403)) {
            console.error(`Failed to fetch achievements for appId ${appId}: ${error.response.statusText}`);
        }
        else {
            console.error(`Unexpected error fetching achievements for appId ${appId}:`, error.message);
        }
        return null;
    }
});
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
