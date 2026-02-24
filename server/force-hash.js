const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function forceHashPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user exists, if not create one
    let result = await mongoose.connection.db.collection('users').findOne({ email: 'abi@gmail.com' });
    
    if (!result) {
      console.log('User not found, creating new user...');
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('123456', saltRounds);
      
      await mongoose.connection.db.collection('users').insertOne({
        email: 'abi@gmail.com',
        username: 'abi',
        password: hashedPassword,
        role: 'trainer', // or 'client' if you prefer
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('New user created successfully!');
    } else {
      console.log('User exists, updating password...');
      console.log('Current password in DB:', result.password);
      
      // Force hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('123456', saltRounds);
      console.log('New hashed password:', hashedPassword);
      
      await mongoose.connection.db.collection('users').updateOne(
        { email: 'abi@gmail.com' },
        { $set: { password: hashedPassword } }
      );
    }
    
    console.log('Password successfully updated!');
    
    // Verify the update
    const updatedUser = await mongoose.connection.db.collection('users').findOne({ email: 'abi@gmail.com' });
    console.log('Updated password in DB:', updatedUser.password.substring(0, 20) + '...');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

forceHashPassword();