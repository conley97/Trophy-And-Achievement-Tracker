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
const axios_1 = __importDefault(require("axios"));
const apiKey = '468311f15e12397e80e18c85e3fff815'; // Replace with your actual SteamGridDB API key
// Function to search for a game by name and return the image URL
const searchGameByName = (term, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${term}`, {
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
            const gridUrls = yield searchGridByGameId(firstGameId, limit);
            return gridUrls;
        }
        else {
            console.log('No games found.');
            return [];
        }
    }
    catch (error) {
        console.error('Error searching game:', error);
        return [];
    }
});
// Function to search for a game's grid by its ID and return the image URLs
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
// Function to search for heroes by game ID and return the image URLs
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
// Helper function to get the first game ID
const getFirstGameId = (term, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.steamgriddb.com/api/v2/search/autocomplete/${term}`, {
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
        }
        else {
            console.log('No games found.');
            return -1;
        }
    }
    catch (error) {
        console.error('Error fetching game ID:', error);
        return -1;
    }
});
// Example usage
(() => __awaiter(void 0, void 0, void 0, function* () {
    const gameName = 'God of War';
    const limit = 1;
    // Fetch game grids
    const gridUrls = yield searchGameByName(gameName, limit);
    console.log('Grid Image URLs:', gridUrls);
    // If a game was found, fetch heroes
    if (gridUrls.length > 0) {
        const firstGameId = yield getFirstGameId(gameName, limit);
        const heroUrls = yield searchHeroesByGameId(firstGameId, limit);
        console.log('Hero Image URLs:', heroUrls);
    }
}))();
