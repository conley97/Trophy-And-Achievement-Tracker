// Import required packages
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/users';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Registering user with data:', { username, password });

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    // Include psnId and steamId in the token payload
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        username: user.username, 
        psnId: user.psnId, 
        steamId: user.steamId 
      }, 
      process.env.JWT_SECRET as string,  // Explicitly cast to string
      { expiresIn: '1h' }
    );
    console.log("logging in ", user._id)
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user's PSN ID
router.put('/update-psn-id', async (req, res) => {
  try {
    const { username, psnId } = req.body;
    console.log('Updating PSN ID with data:', { username, psnId });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.psnId = psnId || user.psnId;
    await user.save();

    // Generate a new token with updated user data
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, psnId: user.psnId, steamId: user.steamId },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ message: 'PSN ID updated successfully', token });
  } catch (error: any) {
    console.error('Error during update:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user's Steam ID
router.put('/update-steam-id', async (req, res) => {
  try {
    const { username, steamId } = req.body;
    console.log('Updating Steam ID with data:', { username, steamId });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.steamId = steamId || user.steamId;
    await user.save();

    // Generate a new token with updated user data
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, psnId: user.psnId, steamId: user.steamId },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ message: 'Steam ID updated successfully', token });
  } catch (error: any) {
    console.error('Error during update:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
