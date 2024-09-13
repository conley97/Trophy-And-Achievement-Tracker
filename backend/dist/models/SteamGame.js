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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteamGame = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SteamGameSchema = new mongoose_1.Schema({
    steamId: { type: String, required: true },
    appId: { type: Number, required: true },
    gameName: { type: String, required: true },
    achievements: { type: Array, default: [] },
    imageUrl: { type: String, required: false },
    completion: { type: Number, required: true },
    backgroundUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
});
// Create an index to ensure uniqueness of steamId and appId combination
SteamGameSchema.index({ steamId: 1, appId: 1 }, { unique: true });
exports.SteamGame = mongoose_1.default.model('SteamGame', SteamGameSchema);
exports.default = exports.SteamGame;
