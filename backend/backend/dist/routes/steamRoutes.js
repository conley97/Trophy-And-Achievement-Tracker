"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const steamController_1 = require("../controllers/steamController");
const router = (0, express_1.Router)();
router.get('/:userId/achievements', steamController_1.getUserAchievements);
exports.default = router;
