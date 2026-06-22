const serverless = require('serverless-http');
const app = require('../src/app');

// Ekspor aplikasi Express yang dibungkus sebagai fungsi serverless untuk Vercel
module.exports = serverless(app);