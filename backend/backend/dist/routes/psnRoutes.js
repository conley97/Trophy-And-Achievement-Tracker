"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const psnController_1 = require("../controllers/psnController");
const router = (0, express_1.Router)();
// Route to update trophies in the database
router.post('/update/:username', psnController_1.fetchTrophiesAndUpdateDB);
// Route to get trophies from the database
router.get('/trophies/:username', psnController_1.getPsnTrophies);
exports.default = router;
