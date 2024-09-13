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
const clientId = 'd7t46u698s137v2svsazz2swe8riys';
const clientSecret = 'qkgs9q5e8hbz4esqpywz9q7jmohe18';
let accessToken;
const getAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    if (accessToken)
        return accessToken;
    const response = yield axios_1.default.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        }
    });
    accessToken = response.data.access_token;
    return accessToken;
});
const fetchCoverUrl = (coverId, token) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post('https://api.igdb.com/v4/covers', `fields url; where id = ${coverId};`, {
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.data && response.data.length > 0) {
        return response.data[0].url.replace('t_thumb', 't_cover_big');
    }
    else {
        return '';
    }
});
const fetchGameDetails = (gameName) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getAccessToken();
    let response = yield axios_1.default.post('https://api.igdb.com/v4/games', `search "${gameName}"; fields name, cover, summary, first_release_date; limit 5;`, {
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${token}`
        }
    });
    let gameData = response.data.find((game) => game.name.toLowerCase() === gameName.toLowerCase());
    if (!gameData && response.data.length > 0) {
        gameData = response.data[0];
    }
    if (!gameData) {
        throw new Error('Game not found');
    }
    const coverUrl = gameData.cover ? yield fetchCoverUrl(gameData.cover, token) : '';
    return {
        name: gameData.name,
        summary: gameData.summary,
        coverUrl: coverUrl,
        releaseDate: gameData.first_release_date
    };
});
exports.default = fetchGameDetails;
