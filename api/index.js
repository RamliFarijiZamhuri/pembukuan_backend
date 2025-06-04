// backend/api/index.js

// Import library yang diperlukan
const serverless = require('serverless-http'); // Untuk membungkus aplikasi Express
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import modul-modul aplikasi Express Anda dari folder src/
// PASTIKAN PATH RELATIF INI BENAR!
// Dari 'api/index.js', kita perlu naik satu level (..) untuk masuk ke folder 'src'
const connectDB = require('../src/config/db');
const authRoutes = require('../src/routes/authRoutes');
const transactionRoutes = require('../src/routes/transactionRoutes');
const categoryRoutes = require('../src/routes/categoryRoutes');

// Memuat variabel lingkungan dari file .env (hanya untuk pengembangan lokal)
// Di Vercel, variabel ini akan diatur melalui dashboard Vercel.
dotenv.config();

// Menghubungkan ke database MongoDB
// Pastikan MONGO_URI tersedia sebagai Environment Variable di Vercel
connectDB();

// Inisialisasi aplikasi Express
const app = express();

// Middleware untuk parsing body JSON dari permintaan HTTP
app.use(express.json());

// Konfigurasi CORS (Cross-Origin Resource Sharing)
// Ini sangat penting agar frontend Anda bisa berkomunikasi dengan backend
const corsOptions = {
    // 'origin' akan membaca dari Environment Variable yang diatur di Vercel
    // process.env.FRONTEND_URL harus diisi dengan URL frontend Vercel Anda (misal: https://nama-aplikasi-frontend.vercel.app)
    // Jika belum tahu URL frontend, bisa pakai '*' untuk development, TAPI JANGAN UNTUK PRODUKSI.
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200 // Beberapa browser lawas memerlukan ini
};
app.use(cors(corsOptions));

// Definisi Rute API
// Mengaitkan rute-rute Anda dengan aplikasi Express
// PASTIKAN PATH DASARNYA SESUAI DENGAN YANG DIHARAPKAN FRONTEND (misal: /api/auth)
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

// Rute dasar untuk pengujian API (opsional, tapi bagus untuk verifikasi)
app.get('/api', (req, res) => { // Menggunakan /api sebagai path dasar
    res.send('API Pembukuan Bulanan Berjalan di Vercel!');
});

// Middleware penanganan rute tidak ditemukan (404)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Rute API tidak ditemukan.' });
});

// Middleware penanganan error global
// Ini akan menangkap error yang terjadi di aplikasi Express Anda
app.use((err, req, res, next) => {
    console.error(err.stack); // Log stack trace error ke konsol Vercel
    res.status(500).json({ message: 'Terjadi kesalahan server internal.', error: err.message });
});

// Mengekspor aplikasi Express yang dibungkus sebagai fungsi serverless
// Vercel akan memanggil fungsi ini saat ada permintaan ke endpoint API
module.exports = serverless(app);