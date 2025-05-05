require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user_model'); // Adjust path based on your file structure

const sampleUsers = [
  { name: 'Em', email: 'em@example.com', },
  { name: 'Gray', email: 'gray@example.com'},
  { name: 'Lithan', email: 'bbdog@example.com'},
  { name: 'Puti', email: 'lithan@example.com'},
  { name: 'Ashley', email: 'ashleyn@example.com'},
  { name: 'Joy', email: 'joy@example.com'},
  { name: 'Dave', email: 'dave@example.com'},
  { name: 'Angeline', email: 'Angeline@example.com'},
  { name: 'Rose', email: 'rose@example.com'},
];

async function populateUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Delete all existing users (optional, if you want to start fresh)
    await User.deleteMany({});

    // Insert sample users
    await User.insertMany(sampleUsers);
    console.log('Sample users populated successfully!');
  } catch (error) {
    console.error('Error populating users:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
}

populateUsers();
