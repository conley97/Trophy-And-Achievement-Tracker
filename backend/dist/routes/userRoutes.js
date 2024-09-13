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
// Import required packages
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../models/users"));
const router = express_1.default.Router();
// Register user
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        console.log('Registering user with data:', { username, password });
        // Check if username already exists
        const existingUser = yield users_1.default.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new users_1.default({ username, password: hashedPassword });
        yield user.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Login user
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield users_1.default.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in the environment variables');
        }
        // Include psnId and steamId in the token payload
        const token = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            username: user.username,
            psnId: user.psnId,
            steamId: user.steamId
        }, process.env.JWT_SECRET, // Explicitly cast to string
        { expiresIn: '1h' });
        console.log("logging in ", user._id);
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update user's PSN ID
router.put('/update-psn-id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, psnId } = req.body;
        console.log('Updating PSN ID with data:', { username, psnId });
        const user = yield users_1.default.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.psnId = psnId || user.psnId;
        yield user.save();
        // Generate a new token with updated user data
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), username: user.username, psnId: user.psnId, steamId: user.steamId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'PSN ID updated successfully', token });
    }
    catch (error) {
        console.error('Error during update:', error);
        res.status(500).json({ message: error.message });
    }
}));
// Update user's Steam ID
router.put('/update-steam-id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, steamId } = req.body;
        console.log('Updating Steam ID with data:', { username, steamId });
        const user = yield users_1.default.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.steamId = steamId || user.steamId;
        yield user.save();
        // Generate a new token with updated user data
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), username: user.username, psnId: user.psnId, steamId: user.steamId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Steam ID updated successfully', token });
    }
    catch (error) {
        console.error('Error during update:', error);
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
