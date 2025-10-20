// db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectToMongo = async () => {
  try {
    const MONGO_URI = process.env.MOONGOOSE_URL
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('Retrying connection to MongoDB...');
    setTimeout(connectToMongo, 5000);
  }
};

module.exports = connectToMongo;
