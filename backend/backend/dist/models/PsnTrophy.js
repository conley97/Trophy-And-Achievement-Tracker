"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/PsnTrophy.ts
const mongoose_1 = __importDefault(require("mongoose"));
const trophySchema = new mongoose_1.default.Schema({
    username: String,
    gameName: String,
    platform: String,
    trophies: [{
            trophyId: String,
            trophyName: String,
            trophyType: String,
            trophyRare: String,
            trophyEarnedRate: Number,
            earned: Boolean,
            earnedDateTime: Date
        }]
});
const PsnTrophy = mongoose_1.default.model('PsnTrophy', trophySchema);
exports.default = PsnTrophy;
