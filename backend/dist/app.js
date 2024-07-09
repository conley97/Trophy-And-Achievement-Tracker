"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const psnRoutes_1 = __importDefault(require("./routes/psnRoutes"));
const steamRoutes_1 = __importDefault(require("./routes/steamRoutes"));
const xboxRoutes_1 = __importDefault(require("./routes/xboxRoutes"));
dotenv_1.default.config(); // Make sure this is at the very top
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the .env file');
    process.exit(1); // Exit the application if MONGODB_URI is not defined
}
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
// Middleware to parse JSON
app.use(express_1.default.json());
// Routes
app.use('/psn', psnRoutes_1.default);
app.use('/steam', steamRoutes_1.default);
app.use('/xbox', xboxRoutes_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
exports.default = app;
