"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const igdbController_1 = require("../controllers/igdbController");
const router = (0, express_1.Router)();
// Route to get game details from IGDB
router.get('/game/:gameName', igdbController_1.getIgdbGameDetails);
exports.default = router;
