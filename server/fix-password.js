const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user with plain text password
    const user = await User.findOne({ email: 'abi@gmail.com' });
    
    if (user) {
      console.log('Found user:', user.email);
      
      // Check if password is already hashed (starts with $2a$ or $2b$)
      if (!user.password.startsWith('$2')) {
        console.log('Password needs hashing...');
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        console.log('Password successfully hashed!');
      } else {
        console.log('Password is already hashed');
      }
    } else {
      console.log('User not found');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPassword();