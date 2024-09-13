import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import psnRoutes from './routes/psnRoutes';
import steamRoutes from './routes/steamRoutes';
import userRoutes from './routes/userRoutes';
import igdbRoutes from './routes/igdbRoutes';


dotenv.config(); // Load environment variables

const app = express();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the .env file');
  process.exit(1); // Exit if MONGODB_URI is not defined
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Middleware to parse JSON
app.use(express.json());

// Use CORS middleware
app.use(cors());

// Routes
app.use('/psn', psnRoutes);
app.use('/steam', steamRoutes);
app.use('/user', userRoutes); 
app.use('/igdb', igdbRoutes);

export default app;
