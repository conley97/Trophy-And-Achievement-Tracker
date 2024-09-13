"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const psnRoutes_1 = __importDefault(require("./routes/psnRoutes"));
const steamRoutes_1 = __importDefault(require("./routes/steamRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const igdbRoutes_1 = __importDefault(require("./routes/igdbRoutes"));
dotenv_1.default.config(); // Load environment variables
const app = (0, express_1.default)();
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the .env file');
    process.exit(1); // Exit if MONGODB_URI is not defined
}
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));
// Middleware to parse JSON
app.use(express_1.default.json());
// Use CORS middleware
app.use((0, cors_1.default)());
// Routes
app.use('/psn', psnRoutes_1.default);
app.use('/steam', steamRoutes_1.default);
app.use('/user', userRoutes_1.default);
app.use('/igdb', igdbRoutes_1.default);
exports.default = app;
