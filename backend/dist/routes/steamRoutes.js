"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const steamController_1 = require("../controllers/steamController");
const router = (0, express_1.Router)();
// Route to update Steam games in the database
router.post('/update/:steamId', steamController_1.updateSteamGames);
// Route to get all Steam games from the database
router.get('/games/:steamId', steamController_1.getSteamGames);
// Route to get game details and user achievements for a specific game
router.get('/game/:steamId/:gameName', steamController_1.getSteamGameDetails);
exports.default = router;
