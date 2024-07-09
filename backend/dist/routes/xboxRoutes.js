"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xboxController_1 = require("../controllers/xboxController");
const router = (0, express_1.Router)();
router.get('/:userId/achievements', xboxController_1.getUserXboxAchievements);
exports.default = router;
