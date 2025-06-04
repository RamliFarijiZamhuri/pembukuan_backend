// backend/api/index.js (VERSI DEBUGGING SANGAT MINIMAL)

const serverless = require('serverless-http');
const express = require('express'); // Tetap butuh express untuk membuat app
const dotenv = require('dotenv');

dotenv.config();

// --- DEBUGGING LOG ---
console.log('DEBUG_API: Starting serverless function initialization.');
console.log('DEBUG_API: MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');
console.log('DEBUG_API: FRONTEND_URL:', process.env.FRONTEND_URL ? 'Defined' : 'Undefined');
// --- AKHIR DEBUGGING LOG ---

// Panggil koneksi DB (pastikan src/config/db.js ada dan tidak ada error sintaks)
const connectDB = require('../src/config/db');
connectDB();
console.log('DEBUG_API: Database connection initiated. Check DB logs for success.');

// Buat aplikasi Express paling dasar
const app = express();

// Rute dasar yang akan merespons
app.get('/api', (req, res) => {
    console.log('DEBUG_API: /api route hit.');
    res.send('API Pembukuan Bulanan Berjalan (Minimal)!');
});

// Middleware penanganan 404
app.use((req, res, next) => {
    console.log('DEBUG_API: 404 route hit for:', req.originalUrl);
    res.status(404).json({ message: 'Rute tidak ditemukan (minimal).' });
});

// Middleware penanganan error global
app.use((err, req, res, next) => {
    console.error('DEBUG_API: Global error handler caught:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan server (minimal).', error: err.message });
});

// Mengekspor aplikasi Express yang dibungkus sebagai fungsi serverless
module.exports = serverless(app);
console.log('DEBUG_API: Serverless handler exported.');