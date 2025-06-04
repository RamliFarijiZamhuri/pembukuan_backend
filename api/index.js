// api/index.js

const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config(); // Load env vars for local dev

const app = require('../src/app');
const connectDB = require('../src/config/db');

// Logging for Vercel debugging
console.log('MONGO_URI yang dibaca di Vercel:', process.env.MONGO_URI);
console.log('FRONTEND_URL yang dibaca di Vercel:', process.env.FRONTEND_URL);

// Pastikan koneksi hanya dilakukan sekali
let isConnected = false;
const connectDBOnce = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};
connectDBOnce();

module.exports = serverless(app);
