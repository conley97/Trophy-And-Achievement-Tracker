"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const psnController_1 = require("../controllers/psnController");
const router = (0, express_1.Router)();
// Route to update trophies in the database
router.post('/update/:username', psnController_1.fetchTrophiesAndUpdateDB);
// Route to get trophies from the database
router.get('/trophies/:username', psnController_1.getPsnTrophies);
// Route to get game details and user trophies for a specific game
router.get('/game/:username/:gameName', psnController_1.getPsnGameDetails);
exports.default = router;
