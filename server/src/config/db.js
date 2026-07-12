const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  mongoose.connection.on('connected', () => {
    console.log('[DB] MongoDB connected:', uri);
  });
  mongoose.connection.on('error', (err) => {
    console.error('[DB] Connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected — retrying in 5s');
    setTimeout(connectDB, 5000);
  });

  await mongoose.connect(uri, {
    maxPoolSize: 5, // cap per-instance pool; critical for serverless cold-start bursts
  });
}

module.exports = connectDB;
