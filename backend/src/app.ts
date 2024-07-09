import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import psnRoutes from './routes/psnRoutes';
import steamRoutes from './routes/steamRoutes';
import xboxRoutes from './routes/xboxRoutes';

dotenv.config(); // Make sure this is at the very top

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the .env file');
  process.exit(1); // Exit the application if MONGODB_URI is not defined
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/psn', psnRoutes);
app.use('/steam', steamRoutes);
app.use('/xbox', xboxRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;