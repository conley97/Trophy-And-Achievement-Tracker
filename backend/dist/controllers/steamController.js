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
exports.getUserAchievements = void 0;
const users_1 = require("../models/users");
const steamService_1 = require("../services/steamService");
const getUserAchievements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield users_1.User.findById(userId);
        if (!user || !user.steamId) {
            return res.status(404).send('User or Steam ID not found');
        }
        const achievements = yield (0, steamService_1.getSteamAchievements)(user.steamId);
        user.steamAchievements = achievements;
        yield user.save();
        res.json(achievements);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getUserAchievements = getUserAchievements;
