const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const seedTrainer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connected to MongoDB');

    // Check if trainer already exists
    const existingTrainer = await User.findOne({ role: 'trainer' });
    
    if (existingTrainer) {
      console.log('Trainer already exists:', existingTrainer.email);
      return;
    }

    // Create trainer user
    const trainerData = {
      username: 'trainer',
      email: 'trainer@gymtracker.com',
      password: 'trainer123', // This will be hashed by the pre-save middleware
      role: 'trainer',
      isActive: true
    };

    const trainer = new User(trainerData);
    await trainer.save();

    console.log('Trainer user created successfully!');
    console.log('Email:', trainer.email);
    console.log('Username:', trainer.username);
    console.log('Password: trainer123');
    
  } catch (error) {
    console.error('Error seeding trainer:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedTrainer();