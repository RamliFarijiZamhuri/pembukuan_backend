// api/index.js

// Import library yang diperlukan
const serverless = require('serverless-http');
const dotenv = require('dotenv');

// Memuat variabel lingkungan dari file .env (hanya untuk pengembangan lokal)
// Di Vercel, variabel lingkungan akan diatur melalui dashboard Vercel.
dotenv.config();

// Mengimpor aplikasi Express utama Anda
// PASTIKAN PATH RELATIF INI BENAR!
// Dari 'api/index.js', kita perlu naik satu level (..) untuk masuk ke folder 'src'
const app = require('../src/app');
const connectDB = require('../src/config/db'); // Mengimpor fungsi koneksi DB

// --- DEBUGGING LOG ---
// Ini akan mencetak MONGO_URI ke log Vercel saat fungsi diinisialisasi
console.log('MONGO_URI yang dibaca di Vercel:', process.env.MONGO_URI);
console.log('FRONTEND_URL yang dibaca di Vercel:', process.env.FRONTEND_URL);
// --- AKHIR DEBUGGING LOG ---

// Menghubungkan ke database MongoDB saat fungsi serverless diinisialisasi
// Ini penting agar koneksi database tersedia saat permintaan pertama masuk
connectDB();

// Mengekspor aplikasi Express yang dibungkus sebagai fungsi serverless
// Vercel akan memanggil fungsi ini saat ada permintaan ke endpoint API
module.exports = serverless(app);
