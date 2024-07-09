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
exports.getPsnTrophiesFromDB = exports.fetchAndProcessPsnTrophies = void 0;
const psn_api_1 = require("psn-api");
const PsnTrophy_1 = __importDefault(require("../models/PsnTrophy"));
const fetchAndProcessPsnTrophies = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myNpsso = process.env.PSN_NPSSO;
        const accessCode = yield (0, psn_api_1.exchangeNpssoForCode)(myNpsso);
        const authorization = yield (0, psn_api_1.exchangeCodeForAccessToken)(accessCode);
        const targetAccountId = yield getExactMatchAccountId(authorization, username);
        const trophyTitles = yield fetchAllTitles(authorization, targetAccountId);
        console.log(`Found ${trophyTitles.length} titles for user ${username}.`);
        // Use Promise.all to process all titles in parallel and maintain the order
        const processedTitles = yield Promise.all(trophyTitles.map((title) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Fetching trophies for title: ${title.trophyTitleName}`);
            try {
                const titleTrophies = yield fetchAllTrophies(authorization, title.npCommunicationId, title.trophyTitlePlatform);
                const earnedTrophies = yield fetchAllEarnedTrophies(authorization, targetAccountId, title.npCommunicationId, title.trophyTitlePlatform);
                const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);
                return {
                    gameName: title.trophyTitleName,
                    platform: title.trophyTitlePlatform,
                    trophies: mergedTrophies
                };
            }
            catch (error) {
                console.error(`Error processing trophies for ${title.trophyTitleName}:`, error.message);
                return null; // Return null if there's an error
            }
        })));
        // Filter out titles that encountered errors
        const validTitles = processedTitles.filter(title => title !== null && title.trophies.length > 0);
        // Save all valid titles to the database
        for (const gameData of validTitles) {
            yield PsnTrophy_1.default.findOneAndUpdate({ username, gameName: gameData.gameName, platform: gameData.platform }, { $set: { trophies: gameData.trophies } }, { upsert: true, new: true });
        }
        console.log("All valid trophy data has been successfully saved to MongoDB.");
    }
    catch (error) {
        console.error("An error occurred while processing PSN trophies:", error);
        throw error;
    }
});
exports.fetchAndProcessPsnTrophies = fetchAndProcessPsnTrophies;
const getPsnTrophiesFromDB = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const trophies = yield PsnTrophy_1.default.find({ username }).exec();
    if (!trophies) {
        throw new Error('No trophies found');
    }
    return trophies;
});
exports.getPsnTrophiesFromDB = getPsnTrophiesFromDB;
// Helper functions
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
                console.error('Unexpected response format or no trophies found:', response);
                break; // Break the loop if no trophies are found or response format is unexpected
            }
            offset += limit;
        }
        catch (error) {
            console.error(`API call failed with error:`, error);
            break; // Exit the loop if an API call fails
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
            console.error(`API call failed with error:`, error);
            break; // Exit the loop if an API call fails
        }
    }
    return trophies;
});
const mergeTrophyLists = (titleTrophies, earnedTrophies) => {
    return earnedTrophies.map(earned => (Object.assign(Object.assign({}, titleTrophies.find(t => t.trophyId === earned.trophyId)), earned))).filter(trophy => trophy.trophyId);
};
const normalizeTrophy = (trophy) => {
    var _a, _b;
    return ({
        trophyId: trophy.trophyId,
        trophyName: trophy.trophyName,
        trophyType: trophy.trophyType,
        trophyRare: rarityMap[(_a = trophy.trophyRare) !== null && _a !== void 0 ? _a : 0],
        trophyEarnedRate: Number(trophy.trophyEarnedRate),
        earned: (_b = trophy.earned) !== null && _b !== void 0 ? _b : false,
        earnedDateTime: trophy.earned ? trophy.earnedDateTime : undefined
    });
};
const rarityMap = {
    [psn_api_1.TrophyRarity.VeryRare]: "Very Rare",
    [psn_api_1.TrophyRarity.UltraRare]: "Ultra Rare",
    [psn_api_1.TrophyRarity.Rare]: "Rare",
    [psn_api_1.TrophyRarity.Common]: "Common"
};
