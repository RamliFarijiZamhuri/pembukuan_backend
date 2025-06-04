// backend/api/index.js (VERSI DEBUGGING SANGAT MINIMAL - TANPA DB)

const serverless = require('serverless-http');
const dotenv = require('dotenv'); // Tetap ada untuk variabel lingkungan lain
const express = require('express'); // Import express di sini

dotenv.config();

// --- DEBUGGING LOG ---
console.log('DEBUG_API_NO_DB: Starting serverless function initialization (NO DB).');
console.log('DEBUG_API_NO_DB: MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');
console.log('DEBUG_API_NO_DB: FRONTEND_URL:', process.env.FRONTEND_URL ? 'Defined' : 'Undefined');
// --- AKHIR DEBUGGING LOG ---

// Hapus sementara:
// const connectDB = require('../src/config/db');
// connectDB();
// console.log('DEBUG_API_NO_DB: Database connection initiated.');

// Buat aplikasi Express langsung di sini (versi minimal)
const app = express();

// Middleware dasar
app.use(express.json()); // Tetap pakai ini untuk parsing body
app.use(require('cors')()); // Gunakan cors langsung di sini untuk kesederhanaan

console.log('DEBUG_API_NO_DB: Express app initialized and basic middleware added.'); // <-- Log ini

// Rute dasar yang akan merespons
app.get('/api', (req, res) => {
    console.log('DEBUG_API_NO_DB: /api route hit.');
    res.send('Minimal API is running on Vercel (NO DB)!');
});

// Middleware penanganan 404
app.use((req, res, next) => {
    console.log('DEBUG_API_NO_DB: 404 route hit for:', req.originalUrl);
    res.status(404).send('Not Found (Minimal Vercel NO DB)');
});

// Middleware penanganan error global
app.use((err, req, res, next) => {
    console.error('DEBUG_API_NO_DB: Global error handler caught:', err.message);
    res.status(500).send('Internal Server Error (Minimal Vercel NO DB)');
});

// Mengekspor aplikasi Express yang dibungkus sebagai fungsi serverless
module.exports = serverless(app);
console.log('DEBUG_API_NO_DB: Serverless handler exported.'); // <-- Log ini