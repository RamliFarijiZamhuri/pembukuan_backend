const serverless = require('serverless-http');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../src/app');
const connectDB = require('../src/config/db');

// Koneksi ke MongoDB sekali saja (hindari koneksi ganda)
let isConnected = false;
const connectToDBOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Bungkus Express app
module.exports = async (req, res) => {
  await connectToDBOnce(); // konek DB sebelum handle request
  const handler = serverless(app);
  return handler(req, res);
};
