const mongoose = require('mongoose');
require('dotenv/config');

const uri = process.env.URI_DB;

const db = async () => {
  try {
    const con = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected on ${uri}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};


module.exports = db();
