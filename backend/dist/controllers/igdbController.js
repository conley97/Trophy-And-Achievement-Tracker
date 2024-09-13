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
exports.getIgdbGameDetails = void 0;
const igdbService_1 = __importDefault(require("../services/igdbService"));
const getIgdbGameDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { gameName } = req.params;
        const gameDetails = yield (0, igdbService_1.default)(gameName);
        res.json(gameDetails);
    }
    catch (error) {
        console.error('Error fetching IGDB game details:', error.message);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
});
exports.getIgdbGameDetails = getIgdbGameDetails;
