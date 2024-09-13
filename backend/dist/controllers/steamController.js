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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSteamGameDetails = exports.getSteamGames = exports.updateSteamGames = void 0;
const steamService_1 = require("../services/steamService");
const updateSteamGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { steamId } = req.params;
        yield (0, steamService_1.fetchAndProcessSteamGames)(steamId);
        res.status(200).json({ message: 'Steam games updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateSteamGames = updateSteamGames;
const getSteamGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { steamId } = req.params;
        const games = yield (0, steamService_1.getSteamGamesFromDB)(steamId);
        res.status(200).json(games);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSteamGames = getSteamGames;
const getSteamGameDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { steamId, gameName } = req.params;
        console.log(steamId, gameName);
        const gameDetails = yield (0, steamService_1.getSteamGameDetailsFromDB)(steamId, gameName);
        res.status(200).json(gameDetails);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSteamGameDetails = getSteamGameDetails;
