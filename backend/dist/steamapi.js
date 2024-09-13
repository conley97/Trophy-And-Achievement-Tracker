"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
const STEAM_API_KEY = "2809E5A58A0142C3F9AD9D81EC8648BB"; // Replace with your Steam API key
const STEAM_ID = "76561198363566598"; // Replace with the target Steam user ID
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch the user's owned games
            console.log("Fetching user owned games...");
            const ownedGames = yield fetchOwnedGames(STEAM_API_KEY, STEAM_ID);
            console.log("Owned games fetched successfully. Total games:", ownedGames.length);
            // Prepare the file for writing
            const filePath = `./${STEAM_ID}.json`;
            fs.writeFileSync(filePath, ""); // Clear the file if it already exists
            // Process each game to fetch achievements
            for (const game of ownedGames) {
                console.log(`Processing game: ${game.name} (${game.appid})`);
                try {
                    // Get all achievements for the game
                    const achievements = yield fetchAchievements(STEAM_API_KEY, STEAM_ID, game.appid);
                    if (achievements) {
                        // Write the achievements of this game to the user's JSON file
                        appendToGamesJSON(STEAM_ID, game.name, achievements);
                    }
                    else {
                        console.log(`No achievements found for ${game.name}`);
                    }
                }
                catch (error) {
                    console.error(`Error processing achievements for ${game.name}:`, error.message);
                }
            }
            console.log("All games processed successfully.");
        }
        catch (error) {
            console.error("An error occurred during the script execution:", error.message);
        }
    });
}
const fetchOwnedGames = (apiKey, steamId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
        params: {
            key: apiKey,
            steamid: steamId,
            include_appinfo: true
        }
    });
    return response.data.response.games;
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
        return response.data.playerstats.achievements;
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
const appendToGamesJSON = (steamId, gameName, achievements) => {
    const gameData = {
        gameName,
        achievements
    };
    const filePath = `./${steamId}.json`;
    try {
        fs.appendFileSync(filePath, JSON.stringify(gameData) + "\n");
        console.log(`Data for ${gameName} appended to ${steamId}.json successfully.`);
    }
    catch (error) {
        console.error(`Error appending data for ${gameName} to ${steamId}.json:`, error.message);
    }
};
main();
