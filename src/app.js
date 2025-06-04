const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Mengimpor fungsi koneksi DB

// Mengimpor rute-rute API
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Memuat variabel lingkungan dari file .env (hanya untuk pengembangan lokal)
// Di Vercel, variabel ini akan diatur melalui dashboard Vercel.
dotenv.config();

// Menghubungkan ke database MongoDB
// connectDB() akan dipanggil di api/index.js untuk memastikan koneksi saat fungsi serverless aktif
// Namun, kita tetap bisa memanggilnya di sini untuk pengujian lokal
// connectDB(); // Nonaktifkan ini jika Anda hanya ingin api/index.js yang mengelola koneksi

const app = express();

// Middleware
app.use(express.json()); // Untuk parsing body JSON

// Konfigurasi CORS (Cross-Origin Resource Sharing)
// Untuk produksi, atur 'origin' ke URL frontend Anda
const corsOptions = {
    // process.env.FRONTEND_URL akan dibaca dari Environment Variables di Vercel
    // Di lokal, ini akan membaca dari .env Anda
    origin: process.env.FRONTEND_URL || '*', // Izinkan semua origin untuk pengembangan, batasi untuk produksi
    optionsSuccessStatus: 200 // Beberapa browser lawas memerlukan ini
};
app.use(cors(corsOptions));

// Definisi Rute API
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

// Rute dasar untuk pengujian (tidak akan diakses langsung di Vercel, tapi bagus untuk lokal)
app.get('/', (req, res) => {
    res.send('API Pembukuan Bulanan Berjalan!');
});

// Middleware penanganan rute yang tidak ditemukan (404)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Rute tidak ditemukan.' });
});

// Middleware penanganan error global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan server.', error: err.message });
});

// Mengekspor aplikasi Express agar bisa di-import oleh api/index.js
module.exports = app;
