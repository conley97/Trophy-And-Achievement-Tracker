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
exports.getPsnGameDetails = exports.getPsnTrophies = exports.fetchTrophiesAndUpdateDB = void 0;
const psnService_1 = require("../services/psnService");
// Function to update trophies in the database
const fetchTrophiesAndUpdateDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        yield (0, psnService_1.fetchAndProcessPsnTrophies)(username);
        res.status(200).json({ message: 'Trophies processed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.fetchTrophiesAndUpdateDB = fetchTrophiesAndUpdateDB;
// Function to get trophies from the database
const getPsnTrophies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const trophies = yield (0, psnService_1.getPsnTrophiesFromDB)(username);
        res.status(200).json(trophies);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPsnTrophies = getPsnTrophies;
// Function to get game details and user trophies for a specific game
const getPsnGameDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, gameName } = req.params;
    try {
        const gameDetails = yield (0, psnService_1.getPsnGameDetailsFromDB)(username, gameName);
        res.status(200).json(gameDetails);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPsnGameDetails = getPsnGameDetails;
